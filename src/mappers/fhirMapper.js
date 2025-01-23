export class FHIRMapper {
  convert(parsedHL7) {
    const resources = [];

    if (parsedHL7.patient) {
      resources.push(this.createPatientResource(parsedHL7.patient));
    }
    if (parsedHL7.visit) {
      resources.push(this.createEncounterResource(parsedHL7.visit, parsedHL7.event));
    }
    if (parsedHL7.allergies?.length > 0) {
      parsedHL7.allergies.forEach(allergy => {
        resources.push(this.createAllergyIntoleranceResource(allergy));
      });
    }

    if (parsedHL7.diagnoses?.length > 0) {
      parsedHL7.diagnoses.forEach(diagnosis => {
        resources.push(this.createConditionResource(diagnosis));
      });
   
    if (parsedHL7.order) {
      resources.push(this.createServiceRequestResource(parsedHL7.order));
    }

    if (parsedHL7.observations) {
      parsedHL7.observations.forEach(obs => {
        resources.push(this.createObservationResource(obs));
      });
    }

    return {
      resourceType: 'Bundle',
      type: 'collection',
      entry: resources.map(resource => ({ resource }))
    };
  }

  createPatientResource(patient) {
    return {
      resourceType: 'Patient',
      id: patient.id,
      name: [{
        family: patient.name.family,
        given: [patient.name.given, patient.name.middle].filter(Boolean),
        prefix: patient.name.prefix ? [patient.name.prefix] : undefined,
        suffix: patient.name.suffix ? [patient.name.suffix] : undefined
      }],
      birthDate: this.formatDate(patient.birthDate),
      gender: this.mapGender(patient.gender),
      address: [{
        line: [patient.address.street],
        city: patient.address.city,
        state: patient.address.state,
        postalCode: patient.address.postalCode,
        country: patient.address.country
      }],
      telecom: patient.phoneNumber ? [{
        system: 'phone',
        value: patient.phoneNumber
      }] : undefined,
      maritalStatus: this.mapMaritalStatus(patient.maritalStatus),
      communication: patient.language ? [{
        language: {
          coding: [{
            system: 'urn:ietf:bcp:47',
            code: patient.language
          }]
        }
      }] : undefined
    };
  }

  createEncounterResource(visit, event) {
    return {
      resourceType: 'Encounter',
      id: visit.visitNumber,
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: visit.patientClass?.toLowerCase() || 'AMB'
      },
      type: [{
        coding: [{
          system: 'http://snomed.info/sct',
          code: visit.admissionType
        }]
      }],
      period: {
        start: event?.recordedDate,
        end: event?.plannedDate
      },
      participant: visit.attendingDoctor ? [{
        individual: {
          reference: `Practitioner/${visit.attendingDoctor.id}`,
          display: `${visit.attendingDoctor.firstName} ${visit.attendingDoctor.lastName}`
        }
      }] : undefined
    };
  }

  createAllergyIntoleranceResource(allergy) {
    return {
      resourceType: 'AllergyIntolerance',
      type: this.mapAllergyType(allergy.allergyType),
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: allergy.allergyCode
        }]
      },
      criticality: this.mapAllergySeverity(allergy.severity),
      reaction: [{
        manifestation: [{
          text: allergy.reaction
        }]
      }],
      onsetDateTime: this.formatDate(allergy.identificationDate)
    };
  }

  createConditionResource(diagnosis) {
    return {
      resourceType: 'Condition',
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: diagnosis.diagnosisCode,
          display: diagnosis.diagnosisDescription
        }]
      },
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: 'encounter-diagnosis'
        }]
      }],
      onsetDateTime: this.formatDate(diagnosis.diagnosisDateTime)
    };
  }

  createServiceRequestResource(order) {
    return {
      resourceType: 'ServiceRequest',
      id: order.id,
      status: this.mapOrderStatus(order.status),
      intent: 'order',
      priority: this.mapOrderPriority(order.priority),
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: order.serviceId
        }]
      },
      authoredOn: this.formatDate(order.orderDateTime),
      reasonCode: order.reason ? [{
        text: order.reason
      }] : undefined
    };
  }

  createObservationResource(observation) {
    return {
      resourceType: 'Observation',
      id: observation.id,
      status: this.mapObservationStatus(observation.status),
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: observation.type
        }]
      },
      valueQuantity: {
        value: parseFloat(observation.value),
        unit: observation.unit
      },
      referenceRange: [{
        text: observation.referenceRange
      }],
      interpretation: observation.abnormalFlags ? [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
          code: observation.abnormalFlags
        }]
      }] : undefined,
      effectiveDateTime: this.formatDate(observation.effectiveDateTime)
    };
  }

  mapGender(hl7Gender) {
    const genderMap = {
      'F': 'female',
      'M': 'male',
      'O': 'other',
      'U': 'unknown'
    };
    return genderMap[hl7Gender] || 'unknown';
  }

  mapMaritalStatus(hl7Status) {
    const statusMap = {
      'S': 'S',
      'M': 'M',
      'D': 'D',
      'W': 'W'
    };
    return statusMap[hl7Status] ? {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
        code: statusMap[hl7Status]
      }]
    } : undefined;
  }

  mapAllergyType(hl7Type) {
    const typeMap = {
      'DA': 'allergy',
      'FA': 'allergy',
      'MA': 'allergy',
      'MC': 'intolerance'
    };
    return typeMap[hl7Type] || 'allergy';
  }

  mapAllergySeverity(hl7Severity) {
    const severityMap = {
      'SV': 'high',
      'MO': 'moderate',
      'MI': 'low'
    };
    return severityMap[hl7Severity] || 'low';
  }

  mapOrderStatus(hl7Status) {
    const statusMap = {
      'A': 'active',
      'C': 'completed',
      'H': 'on-hold',
      'X': 'cancelled'
    };
    return statusMap[hl7Status] || 'unknown';
  }

  mapOrderPriority(hl7Priority) {
    const priorityMap = {
      'S': 'stat',
      'A': 'asap',
      'R': 'routine'
    };
    return priorityMap[hl7Priority] || 'routine';
  }

  mapObservationStatus(hl7Status) {
    const statusMap = {
      'F': 'final',
      'P': 'preliminary',
      'C': 'corrected',
      'X': 'cancelled'
    };
    return statusMap[hl7Status] || 'unknown';
  }
    
  formatDate(date) {
    if (!date) return undefined;
    // Convert YYYYMMDD to YYYY-MM-DD
    if (date.length === 8) {
      return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
    }
    return date;
  }
 
}
