import { SegmentParsers } from './segmentParsers.js';

export class HL7Parser {
  parse(message) {
    const segments = message.split('\n').filter(Boolean);
    const parsedMessage = {
      allergies: [],
      diagnoses: []
    };

    segments.forEach(segment => {
      const fields = segment.split('|');
      const segmentType = fields[0];

      switch (segmentType) {
        case 'EVN':
          parsedMessage.event = SegmentParsers.parseEVN(fields);
          break;
        case 'PID':
          parsedMessage.patient = this.parsePatient(fields);
          break;
        case 'PV1':
          parsedMessage.visit = SegmentParsers.parsePV1(fields);
          break;
        case 'AL1':
          parsedMessage.allergies.push(SegmentParsers.parseAL1(fields));
          break;
        case 'DG1':
          parsedMessage.diagnoses.push(SegmentParsers.parseDG1(fields));
          break;
        case 'OBR':
          parsedMessage.order = this.parseOrder(fields);
          break;
        case 'OBX':
          if (!parsedMessage.observations) parsedMessage.observations = [];
          parsedMessage.observations.push(this.parseObservation(fields));
          break;
      }
    });

    return parsedMessage;
  }

  parsePatient(fields) {
    return {
      id: fields[3],
      name: this.parseName(fields[5]),
      birthDate: fields[7],
      gender: fields[8],
      address: this.parseAddress(fields[11]),
      phoneNumber: fields[13],
      maritalStatus: fields[16],
      language: fields[15]
    };
  }

  parseOrder(fields) {
    return {
      id: fields[3],
      serviceId: fields[4],
      orderDateTime: fields[6],
      status: fields[25],
      priority: fields[5],
      reason: fields[31]
    };
  }

  parseObservation(fields) {
    return {
      id: fields[3],
      type: fields[3],
      value: fields[5],
      unit: fields[6],
      referenceRange: fields[7],
      abnormalFlags: fields[8],
      status: fields[11],
      effectiveDateTime: fields[14]
    };
  }

  parseName(nameField) {
    if (!nameField) return {};
    const parts = nameField.split('^');
    return {
      family: parts[0] || '',
      given: parts[1] || '',
      middle: parts[2] || '',
      prefix: parts[5] || '',
      suffix: parts[4] || ''
    };
  }

  parseAddress(addressField) {
    if (!addressField) return {};
    const parts = addressField.split('^');
    return {
      street: parts[0] || '',
      city: parts[2] || '',
      state: parts[3] || '',
      postalCode: parts[4] || '',
      country: parts[5] || ''
    };
  }
}