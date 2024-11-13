# Facility Management Hierarchy

```mermaid
classDiagram
    %% Facility Management Hierarchy
    class facility {
        id* integer
        name* varchar
        type* varchar %% e.g., Indoor, Outdoor, Greenhouse
        address json %% Structured address data
        license json %% Facility licensing information
        status varchar %% Active, Inactive, Under Construction
        metadata json %% Additional facility details
        createdById* varchar
        createdAt* timestamp
        updatedAt timestamp
    }

    class area {
        id* integer
        name* varchar
        type* varchar %% e.g., Veg Room, Flower Room, Drying Room
        facilityId* integer %% Links to parent facility
        parentId integer %% For nested areas/zones
        metadata json %% Environmental requirements, etc.
        createdById* varchar
        createdAt* timestamp
        updatedAt timestamp
    }

    class location {
        id* integer
        name* varchar
        type* varchar %% e.g., Bench, Shelf, Rack Position
        areaId* integer %% Links to parent area
        capacity integer %% Maximum number of plants/items
        metadata json %% Position data, dimensions, etc.
        createdById* varchar
        createdAt* timestamp
        updatedAt timestamp
    }

    %% Relationships
    facility --> "*" area: contains
    area --> "*" location: contains
    area --> area: can have sub-areas
    location --> "*" plant: holds plants
    user --> "*" facility: manages
    user --> "*" area: manages
    user --> "*" location: manages
```

## Facility (Top Level)

- Represents a physical cultivation site or building
- Can be a greenhouse, indoor grow, outdoor field, processing facility, etc.
- Has licensing and address information
- Contains multiple areas

## Area (Middle Level)

- Represents distinct spaces within a facility
- Examples: Veg Room, Flower Room, Mother Room, Drying Room, Processing Area
- Can have sub-areas (using parentId) for more granular organization
- Contains multiple locations
- Typically has specific environmental controls/requirements

## Location (Bottom Level)

- Represents specific positions within an area
- Examples: Bench #1, Shelf A, Drying Rack 3
- Has defined capacity for plants/items
- Most granular level of physical organization
- Where individual plants are actually placed

## Benefits of this Structure

- Precise tracking of plant locations
- Environmental control at different levels
- Capacity planning and space management
- Compliance with regulatory requirements for plant tracking
- Flexible organization of growing spaces
