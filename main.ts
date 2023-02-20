#!/usr/bin/env bun
import { Graph, Clonable } from "./graph";

enum RegexContainerType {
   Root = 0,
   Asterisk = 1,
   Dot = 2,
   Bracket = 3,
   Const = 255,
};

const randomRegexContainerType = () => {
   const x = [ RegexContainerType.Root, RegexContainerType.Asterisk, RegexContainerType.Dot,
      RegexContainerType.Bracket, RegexContainerType.Const, ];
      return x[Math.floor(Math.random()*5)];
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
      return new RegexContainer(t, 'a');
   }
}

const printRegexContainerGraph = (g:Graph<RegexContainer>) => {

   
}


const generatePatterns = (sz:number = 3) => {
   const g = new Graph<RegexContainer>(RegexContainer);
   for(let k = 0; k < sz; ++k) {
      const v = g.addVertexByContents(RegexContainer.makeRandom());
      if(v.contents!.containerType == RegexContainerType.Bracket) {
         // add some bracket contents...
         v.sprout(new RegexContainer(RegexContainerType.Const, randomLeafSymbol()));
         while(Math.random() > 0.5) v.sprout(new RegexContainer(RegexContainerType.Const, randomLeafSymbol()));
      }
      
   }
}


generatePatterns();