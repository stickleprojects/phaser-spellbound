export class Stack<T> {
  private items: T[];
  // Private array to store stack elements

  constructor() {
    this.items = [];
    // Initialize the array as empty
    //when a new stack is created
  }

  remove(predicate: (item: T) => boolean) {
    var itemIndex = this.items.findIndex(predicate);
    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      if (DEBUG_LEVEL > 0)
        console.log("Cannot remove item from stack, cannot find it");
    }
  }

  findLast(predicate: (item: T) => boolean): T | undefined {
    return this.items.findLast((i) => predicate(i));
  }
  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find((i) => predicate(i));
  }
  any(predicate: (item: T) => boolean) {
    return this.items.find((i) => predicate(i)) != undefined;
  }
  // Method to push an
  // element onto the stack
  push(element: T): void {
    this.items.push(element);
  }

  // Method to pop an
  // element from the stack
  pop(): T | undefined {
    return this.items.pop();
  }

  // Method to peek the top element
  // of the stack without removing it
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  // Method to check
  // if the stack is empty
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Method to get
  // the size of the stack
  size(): number {
    return this.items.length;
  }

  // Method to
  // clear the stack
  clear(): void {
    this.items = [];
  }

  // Method to print
  // the elements of the stack
  print(): void {
    if (DEBUG_LEVEL > 0) console.log(this.items);
  }
}
