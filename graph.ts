#!/usr/bin/env bun

// @ts - ignore
import './array_extensions';

export interface Clonable {
   // id: number;
   // traversed:bool;
   clone(): any;
   //constructor(ids:number, args...);
}

const VERTEX_DEFAULT_NAME="NO_NAME";

export class Vertex<T extends Clonable> {
   public traversed:boolean = false;
   constructor(
      private graph:Graph<T>
    , public id:number
    , public name:string = VERTEX_DEFAULT_NAME
    , public contents:T|null = null
   ){ }

   forEachAdjacent(action:(other:Vertex<T>) => void) {
      for(let k = 0; k < this.graph.vertices.length; ++k)
         if(this.graph.adjacent[this.id][k] && (this.id != k))
            action(this.graph.vertices[k]);
   }

   isAdjacentTo(other:Vertex<T>):boolean {
      //console.log(this.graph);
      return this.graph.adjacent[this.id][other.id];
   }

   getAdjacent():Vertex<T>[] {
      //console.log(this.graph);
      return this.graph.vertices.filter( this.isAdjacentTo.bind(this) );
   }

   addEdgeTo(leaf:Vertex<T>):void {
      this.graph.addEdge(this, leaf);
   }

   removeEdgeTo(leaf:Vertex<T>):void {
      this.graph.removeEdge(this, leaf);
   }

   delete() {
      this.deleteWithoutIdNormalization();
      this.graph.normalizeVertexIds();
   }

   // This is probably unnecessary, since the id is just the
   // index at which it sits.
   deleteWithoutIdNormalization() {
      for(let k = 0; k < this.graph.adjacent.length; ++k)
         if(k != this.id) this.graph.adjacent[k].splice(this.id, 1);

      this.graph.adjacent.splice(this.id, 1);
      this.graph.vertices.splice(this.id, 1);
   }

   sprout(contents:T, name:string = VERTEX_DEFAULT_NAME):Vertex<T> {
      const leaf = this.graph.addVertexByContents(contents, name);
      this.graph.addEdge(this, leaf);
      return leaf;
   }

   /**
    * moves this vertex before the other one in both the adjacency matrix and
    * the vertices array of the host graph.
    * see: notes.md#1
    */
   moveTo(other:Vertex<T>):void {
      // const moveBeforeHelper = function(arr:Array<any>, target:number, destination:number) {
      //    arr.splice(destination, 0, arr.splice(target, 1)[0]);
      // }
      // moveBeforeHelper(this.graph.vertices, this.id, other.id);
      // this.graph.adjacent.forEach( row => moveBeforeHelper(row, this.id, other.id) );
      // moveBeforeHelper(this.graph.adjacent, this.id, other.id);
      this.graph.vertices.move(this.id, other.id);
      this.graph.adjacent.forEach( row => row.move(this.id, other.id) );
      this.graph.adjacent.move(this.id, other.id);
      this.graph.normalizeVertexIds();
   }

}

/**
 * Let the structure of Graph be a tuple:
 * (vertices, adjacent) = (V, A) = (V, bool²) =: G.
 */
export class Graph<T extends Clonable> {
   public adjacent: boolean[][];
   public vertices: Vertex<T>[];

   constructor(type:{new(...args:any[]):T;}) {
      this.addVertex = (name:string = VERTEX_DEFAULT_NAME, ...args):Vertex<T> => {
         const vertex  = new Vertex<T>(this, this.vertices.length, name, new type(...args));
         this.vertices.push(vertex);
         this.adjacent[vertex.id] = new Array<boolean>();
         for (let k = 0; k < this.vertices.length; k++) {
            this.adjacent[vertex.id][k] = false;
            this.adjacent[k][vertex.id] = false;
         }
         return vertex;
      }

      this.adjacent = new Array().fill(false).map(() => new Array().fill(false));
      this.vertices = new Array().fill(null);
   }

   /*VIRTUAL*/ addVertex(name:string = VERTEX_DEFAULT_NAME, ...args):Vertex<T> {
      return new Vertex<T>(this, this.vertices.length, name);
   };

   addVertexByContents(contents:T, name:string = VERTEX_DEFAULT_NAME) :Vertex<T> {
      const elem  = new Vertex<T>(this, this.vertices.length, name, contents);
      this.vertices.push(elem);
      this.adjacent[elem.id] = new Array<boolean>();
      for (let k = 0; k < this.vertices.length; k++) {
         this.adjacent[elem.id][k] = false;
         this.adjacent[k][elem.id] = false;
      }
      return elem;
   }

   // deleteVertex(vertex:Vertex<T>) {
   //    vertex.delete();
   //}


   addEdgeByIndex(k:number, j:number) {
      this.adjacent[k][j] = true;
   }

   addEdge(v:Vertex<T>, w:Vertex<T>) {
      this.adjacent[v.id][w.id] = true;
   }

   removeEdge(v:Vertex<T>, w:Vertex<T>) {
      this.adjacent[v.id][w.id] = false;
   }


   forEachVertex( action:(vertex:Vertex<T>) => void) {
      for(let k = 0; k < this.vertices.length; ++k)
         action(this.vertices[k]);
   }

   forEachAdjacentVertex(id: number, action:(other:Vertex<T>) => void) {
      for(let k = 0; k < this.vertices.length; ++k) {
         if(this.adjacent[id][k] && (id != k)) {
            action(this.vertices[k]);
         }
      }
   }

   resetTraversedMarker() {
      this.vertices.forEach( x => x.traversed = false );
      //for(let vertex in this.vertices) vertex.traversed = false; //err... wtf?
   }

   markConnectedSubgraph(vertex:Vertex<T>) {
      this.resetTraversedMarker();
      const recurse = (vertex:Vertex<T>) => {
         if(!vertex.traversed) {
            vertex.traversed = true;
            vertex.forEachAdjacent(recurse);
         }
      }
      recurse(vertex);
   }


   deleteSubgraph(root:Vertex<T>):void {
      console.log("+++deleteSubgraph", root.id, root.name);
      this.resetTraversedMarker();
      this.markConnectedSubgraph(root);
      this.vertices.filter( x => x.traversed ).forEach( traversed => traversed.delete() );
   }

   /**
    * creates a clone of the connected graph G' ⊆ G, with {vertex} ∈ G'.
    * Such that for every (v,w) ∈ G², there exists (v',w') ∈ H², with H:= »G'\G«
    * such that v~w == v'~w'. Note: ~:= adjacency operator.
    * @param v (arbitrary root of a connected graph G' ⊆ G.
    * @return v' (the arbitrary root of the cloned connected graph G', analogous to, and twin of, v).
    */
   cloneSubgraph(root:Vertex<T>):Vertex<T> {
      //console.log("+++cloneSubgraph");
      this.markConnectedSubgraph(root);
      // let indexVertex = new Array<[number, Vertex<T>]>();
      // for(let k = 0; k < this.vertices.length; ++k) {
      //    indexVertex.push([k, this.vertices[k]]);
      // }

      const traversed:Vertex<T>[] = this.vertices.filter( v => v.traversed );
      //make copy of current size of vertices.
      const oldVertexCount = this.vertices.length;
      //copy affected vertices as new extension to vertices.
      let rootNew:Vertex<T> = root;
      traversed.forEach( w => {
         if(w.id == root.id) {
            rootNew = this.addVertexByContents(w.contents!.clone());
            rootNew.name = w.name + "'";
         } else {
            const dump = this.addVertexByContents(w.contents!.clone());
            dump.name = w.name + "'";
         }
      });

      for(let x = 0; x < traversed.length; ++x) {
         for(let y = 0; y < traversed.length; ++y) {
              this.adjacent[oldVertexCount + x][oldVertexCount + y]
            = this.adjacent[ traversed[x].id  ][ traversed[y].id  ];

         }
      }
      return rootNew;
   }

   normalizeVertexIds():void {
      for(let k = 0; k < this.vertices.length; ++k)
         this.vertices[k].id = k;
   }

   printAdjacencyMatrix():void {
      console.log("=== adjacency matrix ===");

      const rowBuilder = (k:number, sz:number) => {
         const charCount = 4 + 3*this.adjacent.length;
         const cutoff = 4 + k*3;
         const name = this.vertices[k].name + "; id: " + this.vertices[k].id + "; k: " + k;
         let row = "";
         for(let char = 0; char < charCount; ++char) {
            if(char < cutoff) {
               row += ((char%3) == 1 && char != 1) ? "|" : " ";
            }else{
               row += (char == cutoff) ? "," : "-";
            }
         }
         return row + " " + name;
      }

      const zeroToN = Array.from(Array(this.adjacent.length).keys());
      console.log(zeroToN.map(rowBuilder).join( "\n"));


      for(let k = 0; k < this.adjacent.length;++k)
         console.log(k, this.adjacent[k].map( x => (x) ? 1 : 0 ), this.vertices[k].name);
      console.log("========================");
   }

}
