<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>GTFS Viewer</q-toolbar-title>
        <q-btn flat to="/map" label="Mapa" icon="map" />
        <q-btn flat to="/lines" label="Linhas" icon="list" />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
  
</template>

<script setup lang="ts">
</script>
