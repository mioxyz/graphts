#!/usr/bin/env bun
import { Graph, Clonable } from "./graph";

class VertexString implements Clonable {
   clone():VertexString {
      return new VertexString(this.contents);
   }

   constructor(public contents:string) { }
}

function testA() {
   let g = new Graph<VertexString>(VertexString);
   const A = g.addVertex("A", "vertexStringContentA");
   const B = g.addVertex("B", "vertexStringContentB");
   const C = g.addVertex("C", "vertexStringContentC");

   g.addEdge(A, A);
   g.addEdge(A, B);
   g.addEdge(B, C);
   g.printAdjacencyMatrix();
   g.cloneSubgraph(A);
   g.printAdjacencyMatrix();
}

function testB() {
   console.log("--- Test B");
   let g = new Graph<VertexString>(VertexString);

   const A = g.addVertex("A", "vertexStringContentA");
   const B = g.addVertex("B", "vertexStringContentB");
   const C = g.addVertex("C", "vertexStringContentC");

   g.addEdge(A,A);
   // g.addEdge(A,C);
   g.addEdge(C,A)
   g.addEdge(C,C);
   console.log(" ORIGINAL GRAPH: ");
   g.printAdjacencyMatrix();
   let x = g.cloneSubgraph(A);
   console.log(" GRAPH WITH CLONED PART: ");
   g.printAdjacencyMatrix();
   B.delete();
   console.log(" GRAPH AFTER DELETE »B« OF CLONED SUB-GRAPH: ");
   g.printAdjacencyMatrix();

   g.cloneSubgraph(C);
   console.log(" GRAPH AFTER 2nd CLONED SUB-GRAPH: ");
   g.printAdjacencyMatrix();
   g.deleteSubgraph(C);

   console.log(" GRAPH AFTER DEL SUB-GRAPH: ");
   g.printAdjacencyMatrix();



}


// testA();
testB();