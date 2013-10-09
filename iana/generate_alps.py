import sys

import urllib2
from bs4 import BeautifulSoup


URL = "http://www.iana.org/assignments/link-relations/link-relations.xml"

IANA_GO_BASE = "http://www.iana.org/go/"

PREFIX = """<?xml version="1.0" ?>
<alps>
 <link rel="self" href="http://alps.io/iana/relations"/>
 <link rel="help" href="http://www.iana.org/assignments/link-relations/link-relations.xml"/>

 <doc format="html">
  <p>This document contains ALPS versions of the link relations
  registered with the <a
  href="http://www.iana.org/assignments/link-relations/link-relations.xml">IANA
  registry of link relations</a>. This document reflects the
  %(updated)s revision of the registry.</p>

  <p>The descriptions and links found in this ALPS document are
  informative. Every link relation in this document is equivalent to a
  relation registered with the IANA registry, and the IANA description
  is the normative one.</p>
 </doc>

"""
SUFFIX = "</alps>"

def xref_to_url(xref):
    ref_type = xref['type'] # "uri", "draft", or "rfc".
    ref_data = xref['data']
    help_link = None
    if ref_type == 'uri':
        url = ref_data
    else:
        # Internet-Draft or RFC.
        url = IANA_GO_BASE + ref_data
    return url

def record_as_descriptor(record):
    relation = record.value.string
    description = record.description

    # Replace xrefs in description with html links.
    for xref in description.find_all('xref'):
        xref.name = 'a'
        xref['href'] = xref_to_url(xref)
        xref.string = xref['data']
        del xref['type']
        del xref['data']

    # TODO: do the same for note.

    spec = record.spec
    xref = spec.find('xref')
    help_link = xref_to_url(xref)
    note = spec.find('note') or ''
    if note != '':
        note = "<p>%s</p>" % note.string

    values = dict(relation=relation, description=description, note=note,
                  help_link=help_link)
    data = []
    data.append(' <descriptor id="%(relation)s" type="safe">' % values)
    data.append('  <link rel="help" href="%(help_link)s"/>' % values)
    data.append('  <doc format="html">')
    data.append('   <p>%s</p>%s' % (description.decode_contents(), note))
    data.append('  </doc>')
    data.append(' </descriptor>')
    data.append('')
    return "\n".join(data)

input = urllib2.urlopen(URL).read()
soup = BeautifulSoup(input, "xml")
updated = soup.registry.updated.string
out = sys.stdout

out.write(PREFIX % dict(updated=updated))

for record in soup.find_all("record"):
   out.write(record_as_descriptor(record).encode("utf8"))
   out.write("\n")

out.write(SUFFIX)
