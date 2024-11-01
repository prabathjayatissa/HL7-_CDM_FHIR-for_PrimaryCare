import express from 'express';
import { HL7Parser } from './parsers/hl7Parser.js';
import { FHIRMapper } from './mappers/fhirMapper.js';

const app = express();
app.use(express.text());

const parser = new HL7Parser();
const mapper = new FHIRMapper();

app.post('/convert', (req, res) => {
  try {
    const hl7Message = req.body;
    const parsedHL7 = parser.parse(hl7Message);
    const fhirResource = mapper.convert(parsedHL7);
    res.json(fhirResource);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});