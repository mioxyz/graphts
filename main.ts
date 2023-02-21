#!/usr/bin/env bun
import { Graph, Clonable, Vertex } from "./graph";

enum RegexContainerType {
   Root     = 0  ,
   Asterisk = 1  ,
   Dot      = 2  ,
   Bracket  = 3  ,
   Const    = 255,
};
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
         default: console.log("dafuq?", t);
      }
   }

   isTerminal() {
      return undefined != terminalRegexContainerTypes.find( type => this.containerType == type );
   }
}

const getRoot = (g:Graph<RegexContainer>):Vertex<RegexContainer>|undefined => {
   return g.vertices.find( vertex => vertex.contents?.containerType == RegexContainerType.Root );
}

const printRegexContainerGraph = (g:Graph<RegexContainer>) => {
   const recurse = (leaves:Vertex<RegexContainer>[]):string => {
      let out = "";
      leaves.forEach( (leaf:Vertex<RegexContainer>) => {
         //out += (leaf.contents!.isTerminal()) ? leaf.contents!.leafSymbol : recurse(leaf.getAdjacent());
         if(leaf.contents!.isTerminal()) {
            out += leaf.contents!.leafSymbol;
         }else{
            console.log("recursing on...", leaf.id);
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
      const v = root.sprout(RegexContainer.makeRandom());
      if(v.contents!.containerType == RegexContainerType.Bracket) {
         // add some bracket contents...
         v.sprout(new RegexContainer(RegexContainerType.Const, randomLeafSymbol()));
         while(Math.random() > 0.5) v.sprout(new RegexContainer(RegexContainerType.Const, randomLeafSymbol()));
      }
   }
   printRegexContainerGraph(g);
}


generatePatterns();