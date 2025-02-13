# HL7_CDM_FHIR-for_PrimaryCare

I've enhanced the HL7 to FHIR mapper with comprehensive primary care support:

Added new segment parsers:
EVN (Event Type)
PV1 (Patient Visit)
AL1 (Allergy Information)
DG1 (Diagnosis Information)
Enhanced FHIR resource mapping:
Patient: Added support for telecom, marital status, and language
Encounter: Maps visit information
AllergyIntolerance: Maps allergy records
Condition: Maps diagnoses
ServiceRequest: Added priority and reason
Observation: Added abnormal flags and effective datetime
Improved data handling:
Better date formatting
Enhanced name and address parsing
Comprehensive status mapping
Support for provider information
The server is running on port 3000. 
You can test it by sending HL7 messages to http://localhost:3000/convert.

Need any specific mappings or additional segments supported?
