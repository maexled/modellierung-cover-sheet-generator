import 'semantic-ui-css/semantic.min.css'
import { Button, Checkbox, Form, Grid, Header } from 'semantic-ui-react'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';

class Student {
  constructor(prename, name, matrNr) {
    this.prename = prename;
    this.name = name;
    this.matrNr = matrNr;
  }
}

function App() {

  const [student1, setStudent1] = useState(new Student("", "", ""));
  const [student2, setStudent2] = useState(new Student("", "", ""));

  const [sheetNr, setSheetNr] = useState("");

  const [saveStudents, setSaveStudents] = useState(false);

  useEffect(() => {
    loadStudentsFromLocalStorage();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    // create async function to be able to use await
    const createCoverSheet = async () => {
      const coverPDF = await PDFDocument.load(await fetch(process.env.PUBLIC_URL + '/deckblatt_mod_ss23.pdf').then((res) => res.arrayBuffer()));

      const pages = coverPDF.getPages();
      const firstPage = pages[0];
      const height = firstPage.getSize().height;

      const fontSize = 15;
      const font = await coverPDF.embedFont('Helvetica-Bold');

      firstPage.drawText(sheetNr, {
        x: 155,
        y: height - 83,
        size: fontSize,
        font: font,
      });

      firstPage.drawText(student1.name, {
        x: 75,
        y: height - 140,
        size: fontSize,
        font: font,
      });

      firstPage.drawText(student2.name, {
        x: 75,
        y: height - 170,
        size: fontSize,
        font: font,
      });

      firstPage.drawText(student1.prename, {
        x: 230,
        y: height - 140,
        size: fontSize,
        font: font,
      });

      firstPage.drawText(student2.prename, {
        x: 230,
        y: height - 170,
        size: fontSize,
        font: font,
      });

      firstPage.drawText(student1.matrNr, {
        x: 380,
        y: height - 140,
        size: fontSize,
        font: font,
      });

      firstPage.drawText(student2.matrNr, {
        x: 380,
        y: height - 170,
        size: fontSize,
        font: font,
      });

      if (isFilePicked) {
        const reader = new FileReader();
        console.log(selectedFile);
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = async () => {
          const mergedPdf = await PDFDocument.create();

          const taskPDF = await PDFDocument.load(reader.result);
          const copiedPagesA = await mergedPdf.copyPages(coverPDF, coverPDF.getPageIndices());
          copiedPagesA.forEach((page) => mergedPdf.addPage(page));

          const copiedPagesB = await mergedPdf.copyPages(taskPDF, taskPDF.getPageIndices());
          copiedPagesB.forEach((page) => mergedPdf.addPage(page));

          mergedPdf.setCreator("Modellierung Cover Sheet fill out and merger (https://maexled.github.io/modellierung-cover-sheet-generator/)");

          const blob = new Blob([await mergedPdf.save()], { type: "application/pdf" });
          const sheetName = "A" + sheetNr + "_" + student1.name + "_" + student2.name + ".pdf";
          saveAs(blob, sheetName);
        };
      } else {
        alert("No file selected!");
      }

      if (saveStudents) {
        saveStudentsInLocalStorage();
      }
    };
    createCoverSheet();
  }

  function saveStudentsInLocalStorage() {
    localStorage.setItem("student1", JSON.stringify(student1));
    localStorage.setItem("student2", JSON.stringify(student2));
  }

  function loadStudentsFromLocalStorage() {
    const student1 = JSON.parse(localStorage.getItem("student1"));
    const student2 = JSON.parse(localStorage.getItem("student2"));
    if (student1 != null) {
      setStudent1(student1);
    }
    if (student2 != null) {
      setStudent2(student2);
    }
  }

  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);

  const changeHandler = (event) => {
    if (event.target.files[0].type !== "application/pdf") {
      alert("The uploaded file is not a PDF!");
      return;
    }
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };


  return (
    <div className="App">
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 1200 }}>
          <Header as='h1' color='teal' textAlign='center'>
            Modellierung Cover Sheet fill out and merger
          </Header>
          <Form size='large' onSubmit={handleSubmit}>

            <Form.Input fluid icon='sort numeric up' iconPosition='left' type='number' placeholder='Blatt Nummer' name="sheetNr" onChange={(e) => setSheetNr(e.target.value)} />
            <Grid columns={2} divided>
              <Grid.Row>
                <Grid.Column>
                  <Header as='h3' color='teal' textAlign='center'>
                    Teammitglied 1
                  </Header>
                </Grid.Column>
                <Grid.Column>
                  <Header as='h3' color='teal' textAlign='center'>
                    Teammitglied 2
                  </Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Form.Input fluid icon='user' iconPosition='left' placeholder='Vorname' name="prename-1" value={student1.prename} onChange={(e) => setStudent1({ ...student1, prename: e.target.value })} />
                </Grid.Column>
                <Grid.Column>
                  <Form.Input fluid icon='user' iconPosition='left' placeholder='Vorname' name="prename-2" value={student2.prename} onChange={(e) => setStudent2({ ...student2, prename: e.target.value })} />
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Form.Input fluid icon='user' iconPosition='left' placeholder='Nachname' name="name-1" value={student1.name} onChange={(e) => setStudent1({ ...student1, name: e.target.value })} />
                </Grid.Column>
                <Grid.Column>
                  <Form.Input fluid icon='user' iconPosition='left' placeholder='Nachname' name="name-2" value={student2.name} onChange={(e) => setStudent2({ ...student2, name: e.target.value })} />
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Form.Input fluid icon='student' iconPosition='left' placeholder='Matrikelnumer' name="matrNr-1" value={student1.matrNr} onChange={(e) => setStudent1({ ...student1, matrNr: e.target.value })} />
                </Grid.Column>
                <Grid.Column>
                  <Form.Input fluid icon='student' iconPosition='left' placeholder='Matrikelnumer' name="matrNr-2" value={student2.matrNr} onChange={(e) => setStudent2({ ...student2, matrNr: e.target.value })} />
                </Grid.Column>
              </Grid.Row>
            </Grid>

            <Header as='h3' color='teal' textAlign='center'>
              Task PDF
            </Header>
            <Form.Input type="file" name="file" onChange={changeHandler} />

            {isFilePicked ? (
              <div>
                <p>Filename: {selectedFile.name}</p>
                <p>Filetype: {selectedFile.type}</p>
              </div>
            ) : (
              <p>Select a file to show details</p>
            )}

            <Checkbox label='Save students local in browser' onChange={(e, { checked }) => setSaveStudents(checked)} />

            <Button color='teal' fluid size='large' style={{ marginTop: '15px' }}>
              Create Cover Sheet
            </Button>

          </Form>
        </Grid.Column>
      </Grid>
    </div>
  );
}

export default App;
