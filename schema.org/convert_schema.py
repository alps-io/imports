import os
from bs4 import BeautifulSoup

base_url = "http://alps.io/schema.org/"
# base_url = ""
output_dir = "output/"

ALPS_CLASS_BASE = """<alps>
 <descriptor id="%(label)s" type="semantic"%(href)s>
  <doc href="%(doc)s" />

%(properties)s
 </descriptor>
</alps>"""

ALPS_PROPERTY_BASE_SEMANTIC = """  <descriptor id="%(label)s" type="%(type)s"%(href)s>
   <doc href="%(doc)s" />
  </descriptor>
"""

ALPS_PROPERTY_BASE_LINK = """  <descriptor id="%(label)s" type="%(type)s"%(href)s rt="%(rt)s">
   <doc href="%(doc)s" />
  </descriptor>
"""

def with_property(tag, property):
    return tag.find(property=property)

def all_with_property(tag, property):
    return tag.find_all(property=property)

classes = []
properties = []
classes_by_uri = {}
subclasses_by_uri = {}

class RDFClass(object):
    def __init__(self, div):
        self.uri = div['resource']
        classes_by_uri[self.uri] = self
        self.label = with_property(div, 'rdfs:label').string
        self.comment = with_property(div, 'rdfs:comment').string
        self.superclasses = []
        self.properties = []
        for superclass in all_with_property(div, 'rdfs:subClassOf'):
            superclass_uri = superclass['href']
            self.superclasses.append(superclass_uri)
            subclasses_by_uri.setdefault(superclass_uri, []).append(self)
        # TODO: dc:source

    @property
    def url(self):
        return base_url + self.label + ".xml"

    @property
    def as_alps(self):
        values = dict(label=self.label, doc=self.uri, href="", properties='')
        superclass_urls = []
        for superclass_uri in self.superclasses:
            c = classes_by_uri[superclass_uri]
            superclass_urls.append(c.url + "#" + c.label)
        if len(superclass_urls) > 0:
            values['href'] = ' href="%s"' % (" ".join(superclass_urls))
        values['properties'] = '\n'.join(
            p.as_alps(self, defining_class) for defining_class, p in self.all_properties)
        return ALPS_CLASS_BASE % values

    @property
    def all_properties(self):
        # Yield all properties defined in this class in alphabetical order.
        unsorted = [(self, property) for property in self.properties]
        for c, p in sorted(unsorted, key=lambda x: x[1].label):
            yield c, p

class RDFProperty(object):

    def __init__(self, div):
        self.domains = [x['href'] for x in all_with_property(div, 'http://schema.org/domain')]
        self.domain_classes = [classes_by_uri[domain] for domain in self.domains]
        for domain_class in self.domain_classes:
            domain_class.properties.append(self)
        
        self.ranges = [x['href'] for x in all_with_property(div, 'http://schema.org/range')]
        if len(self.ranges) == 1 and self.ranges[0] == 'http://schema.org/URL':
            # If the only range is 'http://schema.org/URL', then this is a link
            # relation.
            print with_property(div, 'rdfs:label').string
            self.type = 'safe'
        else:
            self.type = 'semantic'
        self.range_classes = [classes_by_uri[range] for range in self.ranges]
        self.comment = with_property(div, 'rdfs:comment').string
        self.label = with_property(div, 'rdfs:label').string
        self.uri = div['resource']

    def url(self, domain_class):
        return domain_class.url + "#" + self.label

    def as_alps(self, for_class, defined_in_class):
        values = dict(
            type=self.type,
            label=self.label,
            href="",
            rt=" ".join(base_url + range_class.label + ".xml" for range_class in self.range_classes),
            doc=self.uri)

        if self.type == "semantic":
            template = ALPS_PROPERTY_BASE_SEMANTIC
        else:
            template = ALPS_PROPERTY_BASE_LINK
        return template % values

input = open("schema_org_rdfa.html").read()
soup = BeautifulSoup(input, "xml")
for div in soup.find_all(typeof="rdfs:Class"):
    classes.append(RDFClass(div))
for div in soup.find_all(typeof='rdf:Property'):
    properties.append(RDFProperty(div))

for c in classes:
    filename = os.path.join(output_dir, c.label + ".xml")
    open(filename, 'w').write(c.as_alps.encode("utf8"))
