export class SegmentParsers {
  static parseEVN(fields) {
    return {
      type: fields[1],
      recordedDate: fields[2],
      plannedDate: fields[3],
      reasonCode: fields[4]
    };
  }

  static parsePV1(fields) {
    return {
      patientClass: fields[2],
      assignedLocation: fields[3],
      admissionType: fields[4],
      attendingDoctor: this.parseProvider(fields[7]),
      visitNumber: fields[19]
    };
  }

  static parseAL1(fields) {
    return {
      allergyType: fields[2],
      allergyCode: fields[3],
      severity: fields[4],
      reaction: fields[5],
      identificationDate: fields[6]
    };
  }

  
  static parseDG1(fields) {
    return {
      diagnosisCode: fields[3],
      diagnosisDescription: fields[4],
      diagnosisType: fields[6],
      diagnosisDateTime: fields[5]
    };
  }

  
  
  }
}
