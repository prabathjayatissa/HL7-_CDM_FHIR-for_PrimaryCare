import { expect, test } from 'vitest';
import { FHIRMapper } from '../mappers/fhirMapper.js';

const mapper = new FHIRMapper();

test('converts patient data to FHIR Patient resource', () => {
  const hl7Data = {
    patient: {
      id: '12345',
      name: { family: 'Doe', given: 'John', middle: 'M' },
      birthDate: '19800101',
      gender: 'M',
      address: {
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        postalCode: '02115'
      }
    }
  };

  const result = mapper.convert(hl7Data);
  
  expect(result.resourceType).toBe('Bundle');
  expect(result.entry[0].resource.resourceType).toBe('Patient');
  expect(result.entry[0].resource.name[0].family).toBe('Doe');
});

test('converts observation to FHIR Observation resource', () => {
  const hl7Data = {
    observations: [{
      id: '12345',
      type: 'WBC',
      value: '7.0',
      unit: 'K/uL',
      referenceRange: '3.5-10.5',
      status: 'F'
    }]
  };

  const result = mapper.convert(hl7Data);
  
  expect(result.entry[0].resource.resourceType).toBe('Observation');
  expect(result.entry[0].resource.valueQuantity.value).toBe(7.0);
});