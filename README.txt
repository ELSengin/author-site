ERICK L. SOKN WEBSITE — VERSION 1

UPLOAD
Upload the entire contents of this folder to the root of your GitHub Pages repository.

MAIN PAGES
index.html                  Home
engineering.html            Engineering Consulting
education.html              Engineering Education
writing.html                Writing index
about.html                  About
contact.html                Contact

FOLDERS
assets/css/styles.css       Site appearance
assets/js/writing-data.js   Writing index data
assets/js/writing.js        Builds the Writing index automatically
education/                  Individual course pages and Must Know overview
writing/                    Individual poem pages and poem template

ENGINEERING EDUCATION
The Engineering Education page provides access to the six-course Engineering
Product Development Curriculum and the focused Must Know overview.

Individual course pages contain course descriptions, core topics, and expandable
detailed course outlines.

ADDING A NEW POEM OR LITERARY ITEM
1. Copy writing/poem-template.html and rename it, for example writing/dead-center.html.
2. Replace POEM TITLE, publication credit, and poem text.
3. Open assets/js/writing-data.js.
4. Copy one poetry object and change title, publication, description, and internalUrl.
5. Save and upload the changed files.

OPTIONAL LINKS
A writing entry can have:
- internalUrl: opens a page on this site
- externalUrl + externalLabel: opens an outside publication
- neither: displays as text only
No blank button appears when a link is omitted.

CONTACT FORM
The contact page is wired to:
https://formsubmit.co/erick.sokn@synergymoldingtech.com

GitHub Pages cannot send email by itself, so this uses a third-party form handler.
Test the form after publishing. If you later choose a different form service, only
the form action in contact.html needs to change.

COPYRIGHT
No site-wide copyright warning is included, by design.
Previously published work can be credited on its individual page.

WRITING INDEX
The Writing index is data-driven so future additions are easy.
