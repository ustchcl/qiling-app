<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />

        <v-img
          alt="Vuetify Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
          width="100"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <!-- <HelloWorld/> -->
      <!-- <v-btn elevation="2" @click="putInTray"> put to tray </v-btn>
      <hello-world/> -->
      <img :src="imgSrc">
      <v-img 
        :src="imgSrc"
        max-height="400"
        max-width="160"
      ></v-img>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { ipcRenderer } from 'electron'
import { getImageList } from "@/resources"
import path from "path"

export default Vue.extend({
  name: 'App',


  data: () => ({
    trayOn: false,
    imgSrc: ''
  }),

  mounted() {
    const imgList = getImageList()
    this.imgSrc = path.resolve(__dirname, `../static/qiling_imgs/${imgList[Math.floor(Math.random() * imgList.length)]}`)
    console.log(this.imgSrc)
  },

  methods: {
    putInTray() {
      if (this.trayOn) {
        this.trayOn = false
        ipcRenderer.send('remove-tray')
      } else {
        this.trayOn = true
        ipcRenderer.send('put-in-tray')
      }
    }
  }
});
</script>
