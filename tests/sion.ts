import * as sinon from 'sinon';
import { SinonStub } from 'sinon';

export class Stub {
  static create<T>(target: T, name: keyof T, afterEach = true) {
    const map = this.stubMap.get(target) || new Map();
    this.stubMap.set(target, map);
    if (map.has(name)) {
      map.get(name).restore();
    }
    const stub: SinonStub = sinon.stub(target, name);
    map.set(name, stub);
    afterEach ? this.eachStubs.push(stub) : this.stubs.push(stub);
    return stub;
  }

  static restore(after = false) {
    if (after) {
      this.restoreStubs(this.stubs);
    }
    this.restoreStubs(this.eachStubs);
  }

  private static stubs: SinonStub[] = [];
  private static eachStubs: SinonStub[] = [];
  private static stubMap: Map<any, Map<string, SinonStub>> = new Map();

  private static restoreStubs(stubs: SinonStub[]) {
    stubs.forEach((stub) => stub.restore());
    stubs.length = 0;
  }
}

function restore() {
  Stub.restore(true);
}

before(function () {
  for (const suite of this.test!.parent!.suites) {
    suite.afterAll('after all', restore);
  }
});

afterEach(() => Stub.restore());
