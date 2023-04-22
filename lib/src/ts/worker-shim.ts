interface SelfShim {
  window?: {
    location: Location;
    encodeURIComponent: typeof encodeURIComponent;
  };
  document?: {
    baseURI: string;
  };
}

const shimmedSelf: SelfShim = self;
if (!shimmedSelf.window) {
  shimmedSelf.window = { location, encodeURIComponent };
}
if (!shimmedSelf.document && location) {
  shimmedSelf.document = { baseURI: location.origin };
}

export {};
