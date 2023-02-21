#!/usr/bin/env bun
import { Graph, Clonable, Vertex } from "./graph";
import './array_extensions';

enum RegexContainerType {
   Root     = 0  ,
   Asterisk = 1  ,
   Dot      = 2  ,
   Bracket  = 3  ,
   Const    = 255,
};
const getRegexContainerString = function(x:RegexContainerType):string {
   return {
      0: "Root",
      1:"Asterisk",
      2:"Dot",
      3: "Bracket",
      255: "Const"
   }[x];
}

const terminalRegexContainerTypes = [
   RegexContainerType.Root      ,
   RegexContainerType.Asterisk  ,
   RegexContainerType.Dot       ,
   RegexContainerType.Const     ,
];

//Non root
const randomRegexContainerType = () => {
   const x = [ RegexContainerType.Asterisk, RegexContainerType.Dot,
      RegexContainerType.Bracket, RegexContainerType.Const, ];
      return x[Math.floor(Math.random()*4)];
}
const randomLeafSymbol = function() {
   const x = ['a', 'b', 'c'];
   return x[Math.floor(Math.random()*5)];
}

class RegexContainer implements Clonable {

   clone():RegexContainer {
      return new RegexContainer(
         this.containerType
       , this.leafSymbol
      );
   }

   constructor(
      public containerType:RegexContainerType
    , public leafSymbol:string = 'x'
   ) {}

   static makeRandom():RegexContainer {
      const t = randomRegexContainerType();
      switch(t) {
         case RegexContainerType.Asterisk: return new RegexContainer(t, '*');
         case RegexContainerType.Dot:      return new RegexContainer(t, '.');
         case RegexContainerType.Const:    return new RegexContainer(t, randomLeafSymbol());
         case RegexContainerType.Bracket:  return new RegexContainer(t, '»');
         default: 
            console.log("dafuq?", t);
            throw new Error("dafuq");
         break;
      }
   }

   isTerminal() {
      return undefined != terminalRegexContainerTypes.find( type => this.containerType == type );
   }
}

const getRoot = (g:Graph<RegexContainer>):Vertex<RegexContainer>|undefined => {
   return g.vertices.find( vertex => vertex.contents?.containerType == RegexContainerType.Root );
}

const reduceLeaves = function(graph:Graph<RegexContainer>, root:Vertex<RegexContainer>):void {
   // remove adjacent asterisk chars.
   for(let dirty = true; dirty;) {
      dirty = false;
      let previous:Vertex<RegexContainer>|null = null;
      root.forEachAdjacent( (leaf:Vertex<RegexContainer>) => {
         if(leaf.contents!.containerType == RegexContainerType.Asterisk
         && previous?.contents!.containerType == RegexContainerType.Asterisk) {
            leaf.delete();
            dirty = true;
         } else previous = leaf;  
      });
   }

   // process asterisk chars.
   for(let dirty = true; dirty;) {
      console.log(">>>>>>>>>> DIRTY <<<<<<<<<<<<");
      dirty = false;
      let previous:Vertex<RegexContainer>|null = null;
      let previousId = 0;
      root.getAdjacent().forEach( (leaf:Vertex<RegexContainer>) => {
         if(leaf.contents!.containerType != RegexContainerType.Asterisk && null == previous) {
            previous = leaf;
         } else {
            //duplicate the last leaf N times... https://www.desmos.com/calculator/vpxuztv2qh
            const N = 1+Math.floor(1/(18*(1.057-Math.random())));
            console.log("N::::", N, leaf.id, graph.vertices.length);
            if(graph.vertices.length > 30) throw new Error();
            for(let k = 0; k < N; ++k) {
               const clone = graph.cloneSubgraph(previous!);
               clone.moveTo(leaf);
               root.addEdgeTo(clone);
            }
            leaf.delete();
            //dirty = true;
         }
      });
   }
}




const printRegexContainerGraph = (g:Graph<RegexContainer>) => {
   const recurse = (leaves:Vertex<RegexContainer>[]):string => {
      let out = "";
      leaves.forEach( (leaf:Vertex<RegexContainer>) => {
         //out += (leaf.contents!.isTerminal()) ? leaf.contents!.leafSymbol : recurse(leaf.getAdjacent());
         if(leaf.contents!.isTerminal()) {
            out += leaf.contents!.leafSymbol;
         }else{
            //console.log("recursing on...", leaf.id);
            //TODO currently only one container namely brackets. replace with switch here in future or something.
            out += `[${recurse(leaf.getAdjacent())}]`;
         }
      });
      return out;
   }
   console.log(recurse(getRoot(g)!.getAdjacent()));
}

const generatePatterns = (sz:number = 10) => {
   const g = new Graph<RegexContainer>(RegexContainer);
   const root = g.addVertex("root", RegexContainerType.Root);
   for(let k = 0; k < sz; ++k) {
      const randy = RegexContainer.makeRandom();
      const v = root.sprout(randy, `${getRegexContainerString(randy.containerType)}::${randy.leafSymbol}`);
      if(v.contents!.containerType == RegexContainerType.Bracket) {
         // add some bracket contents...
         const leafSymbol = randomLeafSymbol();
         v.sprout(new RegexContainer(RegexContainerType.Const, leafSymbol), `Const::${leafSymbol}`);
         while(Math.random() > 0.5) {
            const leafSymbol = randomLeafSymbol();
            v.sprout(new RegexContainer(RegexContainerType.Const, leafSymbol), `Const::${leafSymbol}`);
         }
      }
   }
   g.printAdjacencyMatrix();
   printRegexContainerGraph(g);
   reduceLeaves(g, root);
   g.printAdjacencyMatrix();
   printRegexContainerGraph(g);
}



generatePatterns();
