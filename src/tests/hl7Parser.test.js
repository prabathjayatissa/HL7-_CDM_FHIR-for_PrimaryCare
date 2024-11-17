import { expect, test } from 'vitest';
import { HL7Parser } from '../parsers/hl7Parser.js';

const parser = new HL7Parser();

test('parses PID segment correctly', () => {
  const hl7Message = 'PID|1|12345|12345|1234|Doe^John^M||19800101|M|||123 Main St^^Boston^MA^02115';
  const result = parser.parse(hl7Message);
  
  expect(result.patient).toBeDefined();
  expect(result.patient.name.family).toBe('Doe');
  expect(result.patient.name.given).toBe('John');
  expect(result.patient.birthDate).toBe('19800101');
  expect(result.patient.gender).toBe('M');
});


test('parses OBR segment correctly', () => {
  const hl7Message = 'OBR|1|12345|12345|CBC|||||20230101||||||||||||||||F';
  const result = parser.parse(hl7Message);
  
  expect(result.order).toBeDefined();
  expect(result.order.id).toBe('12345');
  expect(result.order.status).toBe('F');
});

test('parses OBX segment correctly', () => {
  const hl7Message = 'OBX|1|NM|WBC^White Blood Count|1|7.0|K/uL|3.5-10.5|N|||F';
  const result = parser.parse(hl7Message);
  
  expect(result.observations).toBeDefined();
  expect(result.observations[0].value).toBe('7.0');
  expect(result.observations[0].unit).toBe('K/uL');
});
