import * as Alps from './alps';
import * as Schema from './schema.org';

export const propToAlpsDoc = (prop: Schema.Prop): Alps.Doc =>
  new Alps.Doc(prop.label, propToAlpsDescriptors(prop));

function propToAlpsDescriptors(
  prop: Schema.Prop
): Alps.OntologicalDescriptor[] {
  if (prop.rangeIncludes.length > 1) {
    return prop.rangeIncludes.reduce(
      (descriptors, expectedTypeHref) => {
        const typeLabel = hrefToLabel(expectedTypeHref);
        const id = `${prop.label}${typeLabel}`;
        descriptors.push(
          new Alps.OntologicalDescriptor(id, prop.id, prop.label)
        );
        return descriptors;
      },
      [new Alps.OntologicalDescriptor(prop.label, prop.id, prop.label)]
    );
  } else {
    return [new Alps.OntologicalDescriptor(prop.label, prop.id)];
  }
}

const hrefToLabel = (href: string) => new URL(href).pathname.substring(1);

export const typeToAlpsDoc = (type: Schema.Type): Alps.Doc =>
  new Alps.Doc(type.label, [typeToAlpsDescriptor(type)]);

const typeToAlpsDescriptor = (type: Schema.Type): Alps.TaxonomicDescriptor =>
  new Alps.TaxonomicDescriptor(
    type.label,
    type.id,
    type.properties.map((propHref) => {
      const propLabel = hrefToLabel(propHref);
      return new Alps.RefDescriptor(`./${propLabel}.json#${propLabel}`);
    })
  );
