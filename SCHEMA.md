# Database Schema Documentation

## Schema Diagram

```mermaid
classDiagram
%% Core Schema
class user {
id uuid
name varchar
email varchar
emailVerified timestamp
image varchar
role user_role
active boolean
permissions json
preferences json
lastLogin timestamp
createdAt timestamp
updatedAt timestamp
}
class account {
id uuid
userId uuid
type varchar
provider varchar
providerAccountId varchar
refresh_token text
access_token text
expires_at integer
token_type varchar
scope varchar
id_token text
session_state varchar
}
class session {
sessionToken varchar
userId uuid
expires timestamp
}
class systemLog {
id uuid
level log_level
source system_log_source
message text
metadata json
createdAt timestamp
}
%% Facility Schema
class building {
id uuid
name varchar
type building_type
address json
properties json
licenseNumber varchar
description text
status varchar
createdById uuid
createdAt timestamp
updatedAt timestamp
}
class room {
id uuid
buildingId uuid
parentId uuid
name varchar
type room_type
properties json
dimensions json
capacity integer
status varchar
createdById uuid
createdAt timestamp
updatedAt timestamp
}
class location {
id uuid
roomId uuid
name varchar
type location_type
coordinates json
properties json
dimensions json
capacity integer
status varchar
createdById uuid
createdAt timestamp
updatedAt timestamp
}
%% Cultivation Schema
class genetic {
id uuid
name varchar
type genetic_type
breeder varchar
description text
properties json
growProperties json
lineage json
inHouse boolean
status varchar
createdById uuid
createdAt timestamp
updatedAt timestamp
}
class batch {
id uuid
identifier varchar
geneticId uuid
locationId uuid
stage plant_stage
batchStatus batch_status
startDate date
expectedEndDate date
actualEndDate date
plantCount integer
properties json
metadata json
notes text
status varchar
createdById uuid
createdAt timestamp
updatedAt timestamp
}
class plant {
id uuid
identifier varchar
geneticId uuid
locationId uuid
batchId uuid
motherId uuid
source plant_source
stage plant_stage
sex plant_sex
health health_status
plantedDate date
properties json
metadata json
notes text
status varchar
destroyedAt timestamp
destroyReason text
createdById uuid
createdAt timestamp
updatedAt timestamp
}
%% Operations Schema
class sensor {
id uuid
identifier varchar
type sensor_type
manufacturer varchar
model varchar
serialNumber varchar
lastCalibration timestamp
nextCalibration timestamp
calibrationInterval numeric
specifications json
metadata json
locationId uuid
notes text
status varchar
createdById uuid
createdAt timestamp
updatedAt timestamp
}
class sensorReading {
id uuid
sensorId uuid
readingValue numeric
unit varchar
timestamp timestamp
metadata json
createdAt timestamp
updatedAt timestamp
}
class task {
id uuid
title varchar
description text
entityId uuid
entityType task_entity_type
assignedToId uuid
category task_category
priority task_priority
taskStatus task_status
status varchar
dueDate timestamp
startedAt timestamp
completedAt timestamp
properties json
metadata json
createdById uuid
createdAt timestamp
updatedAt timestamp
}
%% Processing Schema
class harvest {
id uuid
identifier varchar
batchId uuid
locationId uuid
harvestDate date
wetWeight numeric
dryWeight numeric
trimWeight numeric
wasteWeight numeric
quality harvest_quality
harvestStatus batch_status
properties json
labResults json
metadata json
notes text
status varchar
createdById uuid
createdAt timestamp
updatedAt timestamp
}
class processing {
id uuid
identifier varchar
harvestId uuid
batchId uuid
locationId uuid
type varchar
method varchar
inputWeight numeric
outputWeight numeric
yieldPercentage numeric
startedAt timestamp
completedAt timestamp
duration numeric
processStatus batch_status
quality harvest_quality
properties json
labResults json
metadata json
notes text
status varchar
createdById uuid
createdAt timestamp
updatedAt timestamp
}
class Note {
id uuid
type note_type
title varchar
content text
entityId uuid
entityType varchar
parentId uuid
properties json
metadata json
status varchar
createdById uuid
createdAt timestamp
updatedAt timestamp
}
%% Core Relationships
user --> "" account
user --> "" session
user --> "" plant : created
user --> "" genetic : created
user --> "" Note : created
user --> "" task : created
user --> "" sensor : created
user --> "" building : created
user --> "" room : created
user --> "" location : created
user --> "" harvest : created
user --> "" processing : created
task --> user : assignedTo
%% Facility Relationships
building --> "" room
room --> "" location
room --> room : parent
location --> "" plant
location --> "" sensor
location --> "" batch
location --> "" harvest
location --> "" processing
%% Cultivation Relationships
genetic --> "" plant
genetic --> "" batch
batch --> "" plant
plant --> plant : mother
plant --> location
%% Operations Relationships
sensor --> "" sensorReading
task --> "" Note
%% Processing Relationships
harvest --> "" processing
batch --> "" harvest
%% Notes Relationships
Note --> Note : parent
Note --> user : createdBy
```

## Schema Groups

### Core Schema

Core user management and system functionality.

#### Users and Authentication

- **user**: Core user entity

  - Role-based access control
  - JSON preferences and permissions
  - Activity tracking
  - OAuth integration

- **account**: OAuth account connections

  - Multiple provider support
  - Token management
  - Provider-specific data

- **session**: User session management
  - Token-based authentication
  - Expiration tracking

#### System

- **systemLog**: System-wide logging
  - Structured logging levels
  - Source categorization
  - JSON metadata support

### Facility Schema

Physical facility and space management.

#### Buildings

- **building**: Physical structures
  - Building categorization
  - Address information
  - License management
  - Environmental controls
  - Security features

#### Rooms

- **room**: Spaces within buildings
  - Hierarchical organization (parent/child)
  - Environmental specifications
  - Dimensional tracking
  - Capacity management

#### Locations

- **location**: Specific positions
  - Precise coordinate tracking
  - Equipment placement
  - Resource allocation
  - Capacity monitoring

### Cultivation Schema

Plant cultivation and genetics management.

#### Genetics

- **genetic**: Strain/variety management
  - Detailed characteristics
  - Growth specifications
  - Lineage tracking
  - Performance metrics

#### Batches

- **batch**: Group cultivation tracking
  - Growth stage management
  - Environmental requirements
  - Resource allocation
  - Yield projections

#### Plants

- **plant**: Individual plant tracking
  - Lifecycle management
  - Health monitoring
  - Genealogy tracking
  - Growth metrics

### Operations Schema

Day-to-day operational management.

#### Sensors

- **sensor**: Environmental monitoring

  - Multiple sensor types
  - Calibration tracking
  - Specification management
  - Maintenance scheduling

- **sensorReading**: Sensor data collection
  - Time-series data
  - Measurement accuracy
  - Environmental context

#### Tasks

- **task**: Work management
  - Multi-entity association
  - Priority and status tracking
  - Assignment management
  - Checklist functionality
  - Scheduling and duration tracking

### Processing Schema

Post-harvest operations and compliance.

#### Harvests

- **harvest**: Harvest tracking
  - Weight measurements
  - Quality grading
  - Lab testing integration
  - Waste tracking
  - Yield analysis

#### Processing

- **processing**: Post-harvest processing
  - Multiple process types
  - Input/output tracking
  - Equipment utilization
  - Quality control
  - Lab result integration

### Notes Schema

Documentation and annotation system.

#### Notes

- **Note**: Multi-purpose annotation system
  - Multiple content types
  - Entity association
  - Hierarchical organization
  - Property customization
  - Metadata tracking

## Best Practices

1. Always maintain referential integrity
2. Use appropriate indexes for performance
3. Include audit trails (created/updated timestamps)
4. Maintain hierarchical relationships
5. Track status changes
6. Store structured metadata in JSON fields
7. Implement proper cascading deletes
8. Use enum types for constrained values
9. Implement proper validation at schema level
10. Maintain consistent naming conventions

## Common Patterns

1. **Tracking Fields**

   - `createdById`, `createdAt`, `updatedAt` on all tables
   - `status` enum for entity state management
   - `metadata` JSON for flexible additional data

2. **Location Hierarchy**

   - Building → Room → Location
   - Support for sub-rooms through parent/child relationships

3. **Entity References**

   - UUID primary keys
   - Consistent foreign key patterns
   - Optional parent/child relationships

4. **Property Storage**

   - Structured JSON for flexible properties
   - Typed metadata fields
   - Standardized measurement units

5. **Status Management**

   - Entity-specific status enums
   - Active/inactive flags
   - Archival support

6. **Measurement Tracking**
   - Precise numeric fields
   - Unit specification
   - Timestamp tracking
