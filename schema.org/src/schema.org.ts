interface Descriptor {
  id: string;
  label: string;
}

export interface Type extends Descriptor {
  properties: string[];
}

export interface Prop extends Descriptor {
  rangeIncludes: string[];
}
