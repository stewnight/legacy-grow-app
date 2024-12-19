# Database Schema

```mermaid
erDiagram

    batch {
        string id
        string(100) identifier UK
        string geneticId
        string locationId
        enum(germination|seedling|vegetative|flowering|harvested|mother|clone) stage
        enum(active|completed|pending|cancelled|archived) batchStatus
        date startDate NULL
        date expectedEndDate NULL
        date actualEndDate NULL
        number plantCount NULL
        json properties NULL
        json metadata NULL
        string notes NULL
        enum(active|inactive|archived|maintenance) status
        string createdById
        date createdAt
        date updatedAt
    }

    building {
        string id
        string(255) name
        enum(indoor|outdoor|greenhouse|hybrid) type
        json address NULL
        json properties NULL
        string(100) licenseNumber NULL
        string description NULL
        enum(active|inactive|archived|maintenance) status
        string createdById
        date createdAt
        date updatedAt
    }

    account {
        string userId
        string(255) type
        string(255) provider
        string(255) providerAccountId
        string refresh_token NULL
        string access_token NULL
        number expires_at NULL
        string(255) token_type NULL
        string(255) scope NULL
        string id_token NULL
        string(255) session_state NULL
    }

    session {
        string(255) sessionToken
        string userId
        date expires
    }

    system_log {
        string id
        enum(debug|info|warn|error|fatal) level
        enum(plants|harvests|jobs|system|auth|sensors|compliance|facility) source
        string message
        json metadata NULL
        date createdAt
    }

    user {
        string id
        string(255) name NULL
        string(255) email UK
        date emailVerified NULL
        string(255) password NULL
        string(255) image NULL
        enum(user|admin|manager|viewer) role
        boolean active NULL
        json permissions NULL
        json preferences NULL
        date lastLogin NULL
        date createdAt
        date updatedAt
    }

    verification_token {
        string(255) identifier
        string(255) token
        date expires
    }

    equipment {
        string id
        string(255) name
        enum(hvac|lighting|irrigation|co2|dehumidifier|fan|filter|sensor|pump|other) type
        string(255) model NULL
        string(255) manufacturer NULL
        string(255) serialNumber NULL
        date purchaseDate NULL
        date warrantyExpiration NULL
        enum(active|maintenance|offline|decommissioned|standby) status
        enum(daily|weekly|biweekly|monthly|quarterly|biannual|annual|as_needed) maintenanceFrequency
        date lastMaintenanceDate NULL
        date nextMaintenanceDate NULL
        string roomId NULL
        string locationId NULL
        json specifications NULL
        json metadata NULL
        string(1000) notes NULL
        string createdById
        date createdAt
        date updatedAt
    }

    genetic {
        string id
        string(255) name
        enum(sativa|indica|hybrid|ruderalis) type
        string(255) breeder NULL
        string description NULL
        json properties NULL
        json growProperties NULL
        json lineage NULL
        boolean inHouse NULL
        enum(active|inactive|archived|maintenance) status
        string createdById
        date createdAt
        date updatedAt
    }

    harvest {
        string id
        string batchId
        string locationId
        enum(pending|in_progress|completed|cancelled|failed|on_hold|archived|maintenance) status
        enum(A|B|C|D|F) quality NULL
        numeric(10,3) wetWeight
        numeric(10,3) dryWeight NULL
        numeric(10,3) wasteWeight NULL
        numeric(5,2) yieldPercentage NULL
        date startedAt NULL
        date completedAt NULL
        numeric(10,2) estimatedDuration NULL
        numeric(10,2) actualDuration NULL
        json properties NULL
        json labResults NULL
        string createdById
        date createdAt
        date updatedAt
    }

    job {
        string id
        string(255) title
        string description NULL
        string entityId NULL
        enum(equipment|plant|batch|location|genetics|sensors|processing|harvest|none) entityType
        string assignedToId NULL
        enum(maintenance|transplanting|cloning|feeding|environmental|harvest|drying|trimming|packing|cleaning|inspection) category
        enum(low|medium|high|urgent|critical) priority
        enum(pending|in_progress|completed|cancelled|blocked|deferred) jobStatus
        enum(active|inactive|archived|maintenance) status
        date dueDate NULL
        date startedAt NULL
        date completedAt NULL
        json properties NULL
        json metadata NULL
        string createdById
        date createdAt
        date updatedAt
    }

    location {
        string id
        string roomId
        string(255) name
        enum(room|section|bench|shelf|tray|pot) type
        json coordinates NULL
        json properties NULL
        json dimensions NULL
        number capacity NULL
        enum(active|inactive|archived|maintenance) status
        string createdById
        date createdAt
        date updatedAt
    }

    note {
        string id
        enum(text|voice|image|file) type
        string(255) title
        string content NULL
        string entityId NULL
        string(50) entityType
        json properties NULL
        string createdById
        date createdAt
        date updatedAt
    }

    plant {
        string id
        string(100) identifier UK
        string geneticId
        string locationId
        string batchId NULL
        string motherId NULL
        enum(seed|clone|mother|tissue_culture) source
        enum(germination|seedling|vegetative|flowering|harvested|mother|clone) stage
        enum(unknown|male|female|hermaphrodite) sex
        enum(healthy|sick|pest|nutrient|dead|quarantine) health
        date plantedDate
        json properties NULL
        json metadata NULL
        string notes NULL
        enum(active|inactive|archived|maintenance) status
        date destroyedAt NULL
        string destroyReason NULL
        string createdById
        date createdAt
        date updatedAt
    }

    processing {
        string id
        string harvestId
        string batchId
        string locationId
        enum(drying|curing|extraction|trimming|packaging|testing) type
        enum(hang_dry|rack_dry|freeze_dry|jar_cure|bulk_cure|co2|ethanol|hydrocarbon|solventless|hand_trim|machine_trim) method
        enum(pending|in_progress|completed|cancelled|failed|on_hold|archived|maintenance) status
        enum(A|B|C|D|F) quality NULL
        numeric(10,3) inputWeight
        numeric(10,3) outputWeight NULL
        numeric(5,2) yieldPercentage NULL
        date startedAt NULL
        date completedAt NULL
        numeric(10,2) estimatedDuration NULL
        numeric(10,2) actualDuration NULL
        json properties NULL
        json labResults NULL
        string createdById
        date createdAt
        date updatedAt
    }

    room {
        string id
        string buildingId
        string parentId NULL
        string(255) name
        enum(vegetation|flowering|drying|storage|processing|mother|clone|quarantine) type
        json properties NULL
        json dimensions NULL
        number capacity NULL
        enum(active|inactive|archived|maintenance) status
        string createdById
        date createdAt
        date updatedAt
    }

    sensor {
        string id
        enum(temperature|humidity|co2|light|ph|ec|moisture|pressure|airflow) type
        string(255) manufacturer NULL
        string(255) model NULL
        string(100) serialNumber NULL
        date lastCalibration NULL
        date nextCalibration NULL
        string calibrationInterval NULL
        string equipmentId NULL
        json specifications NULL
        json metadata NULL
        string locationId NULL
        enum(active|inactive|archived|maintenance) status
        string createdById
        date createdAt
        date updatedAt
    }

    sensor_reading {
        string id
        string sensorId
        numeric(10,2) readingValue
        string(50) unit
        date timestamp
        json metadata NULL
        date createdAt
        date updatedAt
    }

```

## Summary

- Total Tables: 18
- Total Columns: 231
- Total Relations: 0

## Tables

### batch

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| identifier | string(100) | No | - | Yes | No | - |
| geneticId | string | No | - | No | No | - |
| locationId | string | No | - | No | No | - |
| stage | enum(germination|seedling|vegetative|flowering|harvested|mother|clone) | No | - | No | No | - |
| batchStatus | enum(active|completed|pending|cancelled|archived) | No | active | No | No | - |
| startDate | date | Yes | - | No | No | - |
| expectedEndDate | date | Yes | - | No | No | - |
| actualEndDate | date | Yes | - | No | No | - |
| plantCount | number | Yes | - | No | No | - |
| properties | json | Yes | - | No | No | - |
| metadata | json | Yes | - | No | No | - |
| notes | string | Yes | - | No | No | - |
| status | enum(active|inactive|archived|maintenance) | No | active | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### building

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| name | string(255) | No | - | No | No | - |
| type | enum(indoor|outdoor|greenhouse|hybrid) | No | - | No | No | - |
| address | json | Yes | - | No | No | - |
| properties | json | Yes | - | No | No | - |
| licenseNumber | string(100) | Yes | - | No | No | - |
| description | string | Yes | - | No | No | - |
| status | enum(active|inactive|archived|maintenance) | No | active | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### account

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| userId | string | No | - | No | No | - |
| type | string(255) | No | - | No | No | - |
| provider | string(255) | No | - | No | No | - |
| providerAccountId | string(255) | No | - | No | No | - |
| refresh_token | string | Yes | - | No | No | - |
| access_token | string | Yes | - | No | No | - |
| expires_at | number | Yes | - | No | No | - |
| token_type | string(255) | Yes | - | No | No | - |
| scope | string(255) | Yes | - | No | No | - |
| id_token | string | Yes | - | No | No | - |
| session_state | string(255) | Yes | - | No | No | - |

### session

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| sessionToken | string(255) | No | - | No | No | - |
| userId | string | No | - | No | No | - |
| expires | date | No | - | No | No | - |

### system_log

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| level | enum(debug|info|warn|error|fatal) | No | - | No | No | - |
| source | enum(plants|harvests|jobs|system|auth|sensors|compliance|facility) | No | - | No | No | - |
| message | string | No | - | No | No | - |
| metadata | json | Yes | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |

### user

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| name | string(255) | Yes | - | No | No | - |
| email | string(255) | No | - | Yes | No | - |
| emailVerified | date | Yes | - | No | No | - |
| password | string(255) | Yes | - | No | No | - |
| image | string(255) | Yes | - | No | No | - |
| role | enum(user|admin|manager|viewer) | No | user | No | No | - |
| active | boolean | Yes | true | No | No | - |
| permissions | json | Yes |  | No | No | - |
| preferences | json | Yes | [object Object] | No | No | - |
| lastLogin | date | Yes | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### verification_token

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| identifier | string(255) | No | - | No | No | - |
| token | string(255) | No | - | No | No | - |
| expires | date | No | - | No | No | - |

### equipment

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| name | string(255) | No | - | No | No | - |
| type | enum(hvac|lighting|irrigation|co2|dehumidifier|fan|filter|sensor|pump|other) | No | - | No | No | - |
| model | string(255) | Yes | - | No | No | - |
| manufacturer | string(255) | Yes | - | No | No | - |
| serialNumber | string(255) | Yes | - | No | No | - |
| purchaseDate | date | Yes | - | No | No | - |
| warrantyExpiration | date | Yes | - | No | No | - |
| status | enum(active|maintenance|offline|decommissioned|standby) | No | active | No | No | - |
| maintenanceFrequency | enum(daily|weekly|biweekly|monthly|quarterly|biannual|annual|as_needed) | No | - | No | No | - |
| lastMaintenanceDate | date | Yes | - | No | No | - |
| nextMaintenanceDate | date | Yes | - | No | No | - |
| roomId | string | Yes | - | No | No | - |
| locationId | string | Yes | - | No | No | - |
| specifications | json | Yes | - | No | No | - |
| metadata | json | Yes | - | No | No | - |
| notes | string(1000) | Yes | - | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### genetic

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| name | string(255) | No | - | No | No | - |
| type | enum(sativa|indica|hybrid|ruderalis) | No | - | No | No | - |
| breeder | string(255) | Yes | - | No | No | - |
| description | string | Yes | - | No | No | - |
| properties | json | Yes | - | No | No | - |
| growProperties | json | Yes | - | No | No | - |
| lineage | json | Yes | - | No | No | - |
| inHouse | boolean | Yes | - | No | No | - |
| status | enum(active|inactive|archived|maintenance) | No | active | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### harvest

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| batchId | string | No | - | No | No | - |
| locationId | string | No | - | No | No | - |
| status | enum(pending|in_progress|completed|cancelled|failed|on_hold|archived|maintenance) | No | pending | No | No | - |
| quality | enum(A|B|C|D|F) | Yes | - | No | No | - |
| wetWeight | numeric(10,3) | No | - | No | No | - |
| dryWeight | numeric(10,3) | Yes | - | No | No | - |
| wasteWeight | numeric(10,3) | Yes | - | No | No | - |
| yieldPercentage | numeric(5,2) | Yes | - | No | No | - |
| startedAt | date | Yes | - | No | No | - |
| completedAt | date | Yes | - | No | No | - |
| estimatedDuration | numeric(10,2) | Yes | - | No | No | - |
| actualDuration | numeric(10,2) | Yes | - | No | No | - |
| properties | json | Yes | - | No | No | - |
| labResults | json | Yes | - | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### job

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| title | string(255) | No | - | No | No | - |
| description | string | Yes | - | No | No | - |
| entityId | string | Yes | - | No | No | - |
| entityType | enum(equipment|plant|batch|location|genetics|sensors|processing|harvest|none) | No | - | No | No | - |
| assignedToId | string | Yes | - | No | No | - |
| category | enum(maintenance|transplanting|cloning|feeding|environmental|harvest|drying|trimming|packing|cleaning|inspection) | No | - | No | No | - |
| priority | enum(low|medium|high|urgent|critical) | No | - | No | No | - |
| jobStatus | enum(pending|in_progress|completed|cancelled|blocked|deferred) | No | - | No | No | - |
| status | enum(active|inactive|archived|maintenance) | No | active | No | No | - |
| dueDate | date | Yes | - | No | No | - |
| startedAt | date | Yes | - | No | No | - |
| completedAt | date | Yes | - | No | No | - |
| properties | json | Yes | [object Object] | No | No | - |
| metadata | json | Yes | [object Object] | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### location

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| roomId | string | No | - | No | No | - |
| name | string(255) | No | - | No | No | - |
| type | enum(room|section|bench|shelf|tray|pot) | No | - | No | No | - |
| coordinates | json | Yes | - | No | No | - |
| properties | json | Yes | - | No | No | - |
| dimensions | json | Yes | - | No | No | - |
| capacity | number | Yes | - | No | No | - |
| status | enum(active|inactive|archived|maintenance) | No | active | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### note

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| type | enum(text|voice|image|file) | No | text | No | No | - |
| title | string(255) | No | - | No | No | - |
| content | string | Yes | - | No | No | - |
| entityId | string | Yes | - | No | No | - |
| entityType | string(50) | No | - | No | No | - |
| properties | json | Yes | - | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### plant

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| identifier | string(100) | No | - | Yes | No | - |
| geneticId | string | No | - | No | No | - |
| locationId | string | No | - | No | No | - |
| batchId | string | Yes | - | No | No | - |
| motherId | string | Yes | - | No | No | - |
| source | enum(seed|clone|mother|tissue_culture) | No | - | No | No | - |
| stage | enum(germination|seedling|vegetative|flowering|harvested|mother|clone) | No | - | No | No | - |
| sex | enum(unknown|male|female|hermaphrodite) | No | unknown | No | No | - |
| health | enum(healthy|sick|pest|nutrient|dead|quarantine) | No | healthy | No | No | - |
| plantedDate | date | No | - | No | No | - |
| properties | json | Yes | - | No | No | - |
| metadata | json | Yes | - | No | No | - |
| notes | string | Yes | - | No | No | - |
| status | enum(active|inactive|archived|maintenance) | No | active | No | No | - |
| destroyedAt | date | Yes | - | No | No | - |
| destroyReason | string | Yes | - | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### processing

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| harvestId | string | No | - | No | No | - |
| batchId | string | No | - | No | No | - |
| locationId | string | No | - | No | No | - |
| type | enum(drying|curing|extraction|trimming|packaging|testing) | No | - | No | No | - |
| method | enum(hang_dry|rack_dry|freeze_dry|jar_cure|bulk_cure|co2|ethanol|hydrocarbon|solventless|hand_trim|machine_trim) | No | - | No | No | - |
| status | enum(pending|in_progress|completed|cancelled|failed|on_hold|archived|maintenance) | No | pending | No | No | - |
| quality | enum(A|B|C|D|F) | Yes | - | No | No | - |
| inputWeight | numeric(10,3) | No | - | No | No | - |
| outputWeight | numeric(10,3) | Yes | - | No | No | - |
| yieldPercentage | numeric(5,2) | Yes | - | No | No | - |
| startedAt | date | Yes | - | No | No | - |
| completedAt | date | Yes | - | No | No | - |
| estimatedDuration | numeric(10,2) | Yes | - | No | No | - |
| actualDuration | numeric(10,2) | Yes | - | No | No | - |
| properties | json | Yes | - | No | No | - |
| labResults | json | Yes | - | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### room

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| buildingId | string | No | - | No | No | - |
| parentId | string | Yes | - | No | No | - |
| name | string(255) | No | - | No | No | - |
| type | enum(vegetation|flowering|drying|storage|processing|mother|clone|quarantine) | No | - | No | No | - |
| properties | json | Yes | - | No | No | - |
| dimensions | json | Yes | - | No | No | - |
| capacity | number | Yes | - | No | No | - |
| status | enum(active|inactive|archived|maintenance) | No | active | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### sensor

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| type | enum(temperature|humidity|co2|light|ph|ec|moisture|pressure|airflow) | No | - | No | No | - |
| manufacturer | string(255) | Yes | - | No | No | - |
| model | string(255) | Yes | - | No | No | - |
| serialNumber | string(100) | Yes | - | No | No | - |
| lastCalibration | date | Yes | - | No | No | - |
| nextCalibration | date | Yes | - | No | No | - |
| calibrationInterval | string | Yes | - | No | No | - |
| equipmentId | string | Yes | - | No | No | - |
| specifications | json | Yes | - | No | No | - |
| metadata | json | Yes | - | No | No | - |
| locationId | string | Yes | - | No | No | - |
| status | enum(active|inactive|archived|maintenance) | No | active | No | No | - |
| createdById | string | No | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

### sensor_reading

#### Columns

| Name | Type | Nullable | Default | Unique | Primary | References |
|------|------|----------|----------|---------|----------|------------|
| id | string | No | [object Object] | No | No | - |
| sensorId | string | No | - | No | No | - |
| readingValue | numeric(10,2) | No | - | No | No | - |
| unit | string(50) | No | - | No | No | - |
| timestamp | date | No | [object Object] | No | No | - |
| metadata | json | Yes | - | No | No | - |
| createdAt | date | No | [object Object] | No | No | - |
| updatedAt | date | No | [object Object] | No | No | - |

