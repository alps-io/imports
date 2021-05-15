export class Doc {
  constructor(readonly fileName: string, readonly descriptors: Descriptor[]) {}

  toJSON() {
    return {
      $schema: 'https://alps-io.github.io/schemas/alps.json',
      alps: {
        version: '1.0',
        descriptor: this.descriptors
      }
    };
  }
}

export type Descriptor = OntologicalDescriptor | TaxonomicDescriptor;

export class OntologicalDescriptor {
  readonly type = 'semantic';

  constructor(
    readonly id: string,
    readonly def: string,
    readonly name?: string
  ) {}
}

export class TaxonomicDescriptor {
  constructor(
    readonly id: string,
    readonly def: string,
    readonly descriptors: RefDescriptor[]
  ) {}

  toJSON() {
    return {
      id: this.id,
      def: this.def,
      descriptor: this.descriptors
    };
  }
}

export class RefDescriptor {
  constructor(readonly href: string) {}
}
