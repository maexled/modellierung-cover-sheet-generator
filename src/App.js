import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Header } from 'semantic-ui-react'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver';
import { useState } from 'react';

function App() {

  const handleSubmit = (event) => {
    event.preventDefault();
    const sheetNr = state["sheetNr"] ? state["sheetNr"] : "";
    const prename1 = state["prename-1"] ? state["prename-1"] : "";
    const prename2 = state["prename-2"] ? state["prename-2"] : "";
    const name1 = state["name-1"] ? state["name-1"] : "";
    const name2 = state["name-2"] ? state["name-2"] : "";
    const matrNr1 = state["matrNr-1"] ? state["matrNr-1"] : "";
    const matrNr2 = state["matrNr-2"] ? state["matrNr-2"] : "";

    // create async function to be able to use await
    const createCoverSheet = async () => {
      const coverPDF = await PDFDocument.load(await fetch('/deckblatt_mod_ss23.pdf').then((res) => res.arrayBuffer()));

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

      firstPage.drawText(name1, {
        x: 75,
        y: height - 140,
        size: fontSize,
        font: font,
      });

      firstPage.drawText(name2, {
        x: 75,
        y: height - 170,
        size: fontSize,
        font: font,
      });

      firstPage.drawText(prename1, {
        x: 230,
        y: height - 140,
        size: fontSize,
        font: font,
      });

      firstPage.drawText(prename2, {
        x: 230,
        y: height - 170,
        size: fontSize,
        font: font,
      });

      firstPage.drawText(matrNr1, {
        x: 380,
        y: height - 140,
        size: fontSize,
        font: font,
      });

      firstPage.drawText(matrNr2, {
        x: 380,
        y: height - 170,
        size: fontSize,
        font: font,
      });

      if (isFilePicked) {
        const reader = new FileReader();
        const mergedPdf = await PDFDocument.create();
        console.log(selectedFile);
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = async () => {
          const taskPDF = await PDFDocument.load(reader.result);
          const copiedPagesA = await mergedPdf.copyPages(coverPDF, coverPDF.getPageIndices());
          copiedPagesA.forEach((page) => mergedPdf.addPage(page));

          const copiedPagesB = await mergedPdf.copyPages(taskPDF, taskPDF.getPageIndices());
          copiedPagesB.forEach((page) => mergedPdf.addPage(page));

          const blob = new Blob([await mergedPdf.save()], { type: "application/pdf" });
          const sheetName = "A" + sheetNr + "_" + name1  + "_" + name2 + ".pdf";
          saveAs(blob, sheetName);
        };
      } else {
        alert("No file selected!");
      }
    };
    createCoverSheet();
  }

  const state = {}

  const handleChange = (e, { name, value }) => state[name] = value;

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

            <Form.Input fluid icon='sort numeric up' iconPosition='left' type='number' placeholder='Blatt Nummer' name="sheetNr" onChange={handleChange} />
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
                  <Form.Input fluid icon='user' iconPosition='left' placeholder='Vorname' name="prename-1" onChange={handleChange} />
                </Grid.Column>
                <Grid.Column>
                  <Form.Input fluid icon='user' iconPosition='left' placeholder='Vorname' name="prename-2" onChange={handleChange} />
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Form.Input fluid icon='user' iconPosition='left' placeholder='Nachname' name="name-1" onChange={handleChange} />
                </Grid.Column>
                <Grid.Column>
                  <Form.Input fluid icon='user' iconPosition='left' placeholder='Nachname' name="name-2" onChange={handleChange} />
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Form.Input fluid icon='student' iconPosition='left' placeholder='Matrikelnumer' name="matrNr-1" onChange={handleChange} />
                </Grid.Column>
                <Grid.Column>
                  <Form.Input fluid icon='student' iconPosition='left' placeholder='Matrikelnumer' name="matrNr-2" onChange={handleChange} />
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

            <Button color='teal' fluid size='large'>
              Create Cover Sheet
            </Button>

          </Form>
        </Grid.Column>
      </Grid>
    </div>
  );
}

export default App;
