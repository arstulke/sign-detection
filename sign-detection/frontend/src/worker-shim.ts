interface DocumentShim {
	baseURI: string;
}

interface SelfShim {
	document: DocumentShim;
}

const shimmedSelf: SelfShim = self;
shimmedSelf.document = { baseURI: location.origin };

export {};
