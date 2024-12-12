# Project Structure

```
📁legacy-grow-app
  📁drizzle
    📁meta
      _journal.json
      0000_snapshot.json
      0001_snapshot.json
      0002_snapshot.json
      0003_snapshot.json
      0004_snapshot.json
      0005_snapshot.json
      0006_snapshot.json
      0007_snapshot.json
      0008_snapshot.json
      0009_snapshot.json
    0000_next_silk_fever.sql
    0001_shocking_mindworm.sql
    0002_white_ma_gnuci.sql
    0003_unique_gwen_stacy.sql
    0004_futuristic_talon.sql
    0005_spooky_thor.sql
    0006_breezy_venus.sql
    0007_damp_cargill.sql
    0008_thin_proudstar.sql
    0009_silent_reavers.sql
  📁public
    favicon.svg
  📁scripts
    generate-schema.ts
    generate-structure.ts
  📁src
    📁app
      📁(app)
        📁batches
          📁[id]
            page.tsx
          page.tsx
        📁equipment
          📁[id]
            page.tsx
          page.tsx
        📁genetics
          📁[id]
            page.tsx
          page.tsx
        📁jobs
          📁[id]
            page.tsx
          page.tsx
        📁locations
          📁[id]
            page.tsx
          page.tsx
        📁plants
          📁[id]
            page.tsx
          page.tsx
        📁rooms
          📁[id]
            page.tsx
          page.tsx
      📁api
        📁auth
        📁trpc
          📁[trpc]
            route.ts
      📁dashboard
        page.tsx
      layout.tsx
      page.tsx
    📁components
      📁batches
        batches-columns.tsx
        batches-form.tsx
      📁calendar
        📁views
          month-view.tsx
          period-view.tsx
        calendar-header.tsx
        calendar-view.tsx
        job-card.tsx
      📁dashboard
        maintenance-overview.tsx
        overview.tsx
        quick-actions.tsx
        recent-plants.tsx
      📁equipment
        equipment-columns.tsx
        equipment-form.tsx
        maintenance-tab.tsx
        tab.tsx
      📁gantt
        gantt-view.tsx
      📁genetics
        genetics-columns.tsx
        genetics-form.tsx
      📁jobs
        instructions-manager.tsx
        jobs-columns.tsx
        jobs-form.tsx
        notes-manager.tsx
        recurring-settings.tsx
        requirements-manager.tsx
        tab.tsx
        task-manager.tsx
      📁layout
        app-sheet.tsx
        app-sidebar.tsx
        custom-breadcrumbs.tsx
        header.tsx
        nav-main.tsx
        nav-secondary.tsx
        nav-user.tsx
      📁locations
        locations-columns.tsx
        locations-form.tsx
      📁notes
        create-note-form.tsx
        media-preview.tsx
        media-uploader.tsx
        note-card.tsx
        timeline.tsx
      📁plants
        plants-columns.tsx
        plants-form.tsx
      📁rooms
        rooms-columns.tsx
        rooms-form.tsx
      📁ui
        alert-dialog.tsx
        alert.tsx
        avatar.tsx
        badge.tsx
        breadcrumb.tsx
        button.tsx
        calendar.tsx
        card.tsx
        chart.tsx
        checkbox.tsx
        collapsible.tsx
        command.tsx
        data-table-column-header.tsx
        data-table-faceted-filter.tsx
        data-table.tsx
        date-picker.tsx
        dialog.tsx
        dropdown-menu.tsx
        form.tsx
        hover-card.tsx
        input.tsx
        label.tsx
        popover.tsx
        progress.tsx
        radio-group.tsx
        resizable.tsx
        scroll-area.tsx
        select.tsx
        separator.tsx
        sheet.tsx
        sidebar.tsx
        skeleton.tsx
        slider.tsx
        switch.tsx
        table.tsx
        tabs.tsx
        textarea.tsx
        toast.tsx
        toaster.tsx
        tooltip.tsx
      base-form.tsx
      create-form-wrapper.tsx
      icons.tsx
      media-upload.tsx
      session-provider.tsx
      theme-provider.tsx
      theme-toggle.tsx
    📁hooks
      use-mobile.tsx
      use-toast.ts
    📁lib
      utils.ts
    📁server
      📁api
        📁routers
          batch.ts
          equipment.ts
          genetic.ts
          harvest.ts
          job.ts
          location.ts
          media.ts
          note.ts
          plant.ts
          processing.ts
          room.ts
          sensor.ts
          sensorReading.ts
          user.ts
        root.ts
        trpc.ts
      📁auth
        config.ts
        index.ts
      📁db
        📁schema
          batches.ts
          core.ts
          enums.ts
          equipment.ts
          genetics.ts
          harvests.ts
          index.ts
          jobs.ts
          locations.ts
          notes.ts
          plants.ts
          processing.ts
          rooms.ts
          sensorReadings.ts
          sensors.ts
        index.ts
        utils.ts
      storage.ts
    📁styles
      globals.css
    📁trpc
      query-client.ts
      react.tsx
      server.ts
    env.js
  .cursorrules
  .env
  .env.example
  .eslintignore
  .eslintrc.cjs
  components.json
  drizzle.config.ts
  middleware.ts
  next-env.d.ts
  next.config.js
  package.json
  pnpm-lock.yaml
  postcss.config.js
  prettier.config.js
  PROMPT.md
  README.md
  SCHEMA.md
  STRUCTURE.md
  tailwind.config.ts
  tsconfig.json
=======
└── 📁legacy-grow-app
    └── 📁.github
        └── FUNDING.yml
    └── 📁.vercel
        └── project.json
        └── README.txt
    └── 📁drizzle
        └── 📁meta
            └── _journal.json
            └── 0000_snapshot.json
            └── 0001_snapshot.json
            └── 0002_snapshot.json
            └── 0003_snapshot.json
            └── 0004_snapshot.json
            └── 0005_snapshot.json
            └── 0006_snapshot.json
            └── 0007_snapshot.json
            └── 0008_snapshot.json
            └── 0009_snapshot.json
        └── 0000_next_silk_fever.sql
        └── 0001_shocking_mindworm.sql
        └── 0002_white_ma_gnuci.sql
        └── 0003_unique_gwen_stacy.sql
        └── 0004_futuristic_talon.sql
        └── 0005_spooky_thor.sql
        └── 0006_breezy_venus.sql
        └── 0007_damp_cargill.sql
        └── 0008_thin_proudstar.sql
        └── 0009_silent_reavers.sql
    └── 📁public
        └── favicon.svg
    └── 📁src
        └── 📁app
            └── 📁(app)
                └── 📁batches
                    └── 📁[id]
                        └── page.tsx
                    └── page.tsx
                └── 📁buildings
                    └── 📁[id]
                        └── page.tsx
                    └── page.tsx
                └── 📁equipment
                    └── 📁[id]
                        └── page.tsx
                    └── page.tsx
                └── 📁genetics
                    └── 📁[id]
                        └── page.tsx
                    └── page.tsx
                └── 📁jobs
                    └── 📁[id]
                        └── page.tsx
                    └── page.tsx
                └── 📁locations
                    └── 📁[id]
                        └── page.tsx
                    └── page.tsx
                └── 📁plants
                    └── 📁[id]
                        └── page.tsx
                    └── page.tsx
                └── 📁rooms
                    └── 📁[id]
                        └── page.tsx
                    └── page.tsx
            └── 📁api
                └── 📁auth
                    └── 📁[...nextauth]
                        └── route.ts
                └── 📁trpc
                    └── 📁[trpc]
                        └── route.ts
            └── 📁dashboard
                └── page.tsx
            └── layout.tsx
            └── page.tsx
        └── 📁components
            └── 📁batches
                └── batches-columns.tsx
                └── batches-form.tsx
            └── 📁buildings
                └── buildings-columns.tsx
                └── buildings-form.tsx
            └── 📁calendar
                └── 📁views
                    └── month-view.tsx
                    └── period-view.tsx
                └── calendar-header.tsx
                └── calendar-view.tsx
                └── job-card.tsx
            └── 📁dashboard
                └── maintenance-overview.tsx
                └── overview.tsx
                └── quick-actions.tsx
                └── recent-plants.tsx
                └── strain-distribution.tsx
            └── 📁equipment
                └── equipment-columns.tsx
                └── equipment-form.tsx
                └── maintenance-tab.tsx
                └── tab.tsx
            └── 📁gantt
                └── gantt-view.tsx
            └── 📁genetics
                └── genetics-columns.tsx
                └── genetics-form.tsx
            └── 📁jobs
                └── instructions-manager.tsx
                └── jobs-columns.tsx
                └── jobs-form.tsx
                └── notes-manager.tsx
                └── recurring-settings.tsx
                └── requirements-manager.tsx
                └── tab.tsx
                └── task-manager.tsx
            └── 📁layout
                └── app-sheet.tsx
                └── app-sidebar.tsx
                └── custom-breadcrumbs.tsx
                └── header.tsx
                └── nav-main.tsx
                └── nav-secondary.tsx
                └── nav-user.tsx
            └── 📁locations
                └── locations-columns.tsx
                └── locations-form.tsx
            └── 📁notes
                └── create-note-form.tsx
                └── media-preview.tsx
                └── media-uploader.tsx
                └── note-card.tsx
                └── timeline.tsx
            └── 📁plants
                └── plants-columns.tsx
                └── plants-form.tsx
            └── 📁rooms
                └── rooms-columns.tsx
                └── rooms-form.tsx
            └── 📁ui
                └── alert-dialog.tsx
                └── alert.tsx
                └── avatar.tsx
                └── badge.tsx
                └── breadcrumb.tsx
                └── button.tsx
                └── calendar.tsx
                └── card.tsx
                └── chart.tsx
                └── checkbox.tsx
                └── collapsible.tsx
                └── command.tsx
                └── data-table-column-header.tsx
                └── data-table-faceted-filter.tsx
                └── data-table.tsx
                └── date-picker.tsx
                └── dialog.tsx
                └── dropdown-menu.tsx
                └── form.tsx
                └── hover-card.tsx
                └── input.tsx
                └── label.tsx
                └── popover.tsx
                └── progress.tsx
                └── radio-group.tsx
                └── resizable.tsx
                └── scroll-area.tsx
                └── select.tsx
                └── separator.tsx
                └── sheet.tsx
                └── sidebar.tsx
                └── skeleton.tsx
                └── slider.tsx
                └── switch.tsx
                └── table.tsx
                └── tabs.tsx
                └── textarea.tsx
                └── toast.tsx
                └── toaster.tsx
                └── tooltip.tsx
            └── base-form.tsx
            └── create-form-wrapper.tsx
            └── icons.tsx
            └── media-upload.tsx
            └── session-provider.tsx
            └── theme-provider.tsx
            └── theme-toggle.tsx
        └── 📁hooks
            └── use-mobile.tsx
            └── use-toast.ts
        └── 📁lib
            └── utils.ts
        └── 📁server
            └── 📁api
                └── 📁routers
                    └── batch.ts
                    └── building.ts
                    └── equipment.ts
                    └── genetic.ts
                    └── harvest.ts
                    └── job.ts
                    └── location.ts
                    └── media.ts
                    └── note.ts
                    └── plant.ts
                    └── processing.ts
                    └── room.ts
                    └── sensor.ts
                    └── sensorReading.ts
                    └── user.ts
                └── root.ts
                └── trpc.ts
            └── 📁auth
                └── config.ts
                └── index.ts
            └── 📁db
                └── 📁schema
                    └── batches.ts
                    └── buildings.ts
                    └── core.ts
                    └── enums.ts
                    └── equipment.ts
                    └── genetics.ts
                    └── harvests.ts
                    └── index.ts
                    └── jobs.ts
                    └── locations.ts
                    └── notes.ts
                    └── plants.ts
                    └── processing.ts
                    └── rooms.ts
                    └── sensorReadings.ts
                    └── sensors.ts
                └── index.ts
                └── utils.ts
            └── storage.ts
        └── 📁styles
            └── globals.css
        └── 📁trpc
            └── query-client.ts
            └── react.tsx
            └── server.ts
        └── 📁types
        └── env.js
    └── .cursorrules
    └── .env
    └── .env.example
    └── .eslintignore
    └── .eslintrc.cjs
    └── .gitignore
    └── components.json
    └── drizzle.config.ts
    └── middleware.ts
    └── next-env.d.ts
    └── next.config.js
    └── package.json
    └── pnpm-lock.yaml
    └── postcss.config.js
    └── prettier.config.js
    └── PROMPT.md
    └── README.md
    └── SCHEMA.md
    └── STRUCTURE.md
    └── tailwind.config.ts
    └── tsconfig.json
    └── tsconfig.tsbuildinfo
