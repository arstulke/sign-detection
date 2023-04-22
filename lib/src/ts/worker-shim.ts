interface DocumentShim {
  baseURI: string;
}

interface SelfShim {
  window?: {};
  document?: DocumentShim;
}

const shimmedSelf: SelfShim = self;
if (!shimmedSelf.window) {
  shimmedSelf.window = {};
}
if (!shimmedSelf.document && location) {
  shimmedSelf.document = { baseURI: location.origin };
}

export {};
