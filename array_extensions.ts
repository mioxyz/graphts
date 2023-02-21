declare global {
   interface Array<T> {
      /**
       * moves element in array from `fromIndex` to `toIndex` in place.
       */
      move(fromIndex:number, toIndex:number): void;
   }
}

if (!Array.prototype.move) 
   Array.prototype.move = function<T>(this: T[], fromIndex: number, toIndex: number): void
   {
      if (fromIndex === toIndex) return;

      this.splice(toIndex, 0, this.splice(fromIndex, 1)[0]);

      // this.splice(fromIndex, 1);
      // this.splice(toIndex < fromIndex ? toIndex : toIndex - 1, 0, this[fromIndex]);
   };

export {};
