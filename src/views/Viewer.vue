<template>
  <div style="overflow: hidden; background: transparent">
    <div
      @mouseenter="() => (cover = true)"
      @mouseleave="() => (cover = false)"
      class="app-main"
    >
      <v-img
        :v-if="imgSrc.length > 0"
        :src="require(`../assets/qiling_imgs/${imgSrc}`)"
        height="600"
        width="400"
        max-height="600"
        max-width="400"
      ></v-img>

      <div class="sentence">
        <div>{{this.text}}</div>
      </div>

      <div class="cover" v-show="cover">
        <div class="close-btn" @click="closeModal">
          <v-icon large color="success"> mdi-close </v-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from "electron";
import { getImageList } from "@/resources";

import { Vue, Component, Prop } from "vue-property-decorator";
import { mkRequest } from "@/http"

@Component
export default class App extends Vue {
  trayOn = false;
  imgSrc = "";
  cover = false;

  lastWelcome: number | null = null
  welcomed = 0;

  yiyan = "随机";
  time = -1;
  userDefinedText = "";

  text = ""

  created() {
    const query = this.$route.query;
    const time = parseInt(query["time"] as any)
    this.time = isNaN(time) ? -1 : time
    this.yiyan =  (query["yiyan"] as any)  || "随机";
    this.userDefinedText =  (query["userDefinedText"] as any)  || "";
    const imgList = getImageList();
    this.imgSrc = `${imgList[Math.floor(Math.random() * imgList.length)]}`;
    this.fetchYiyan()

    ipcRenderer.send("viewer-ready")
    ipcRenderer.on("random", () => {
      const imgList = getImageList();
      this.imgSrc = `${imgList[Math.floor(Math.random() * imgList.length)]}`;
      this.fetchYiyan()
    })
    ipcRenderer.on("new-setting", (e, yiyan, userDefinedText) => {
      this.yiyan = yiyan
      this.userDefinedText = userDefinedText
    })

    ipcRenderer.on("show-by-hand", () => {
      const imgList = getImageList();
      this.imgSrc = `${imgList[Math.floor(Math.random() * imgList.length)]}`;
      this.text = this.getWelcome()
    })
  }

  welcomeString = [
    "哟~.😉",
    "欢迎欢迎~.🤗",
    "哦哦哦, 你又来了.🤣",
    "还来? 😮",
    "我累了.😌",
    "下次真不出来了😔",
    "最后一次!😕",
    "最最后一次!!🙃",
    "啊??? 这次出问题了, 不可能有下次了!😑",
    "ByeBye了您nei~😤",
    "...🥶",
    "......😡",
    "..........🤬",
  ]

  getWelcome(): string {
    let welcome = ""
    if (this.lastWelcome === null) {
      welcome = "哟~.😉"
    } else {
      if (Date.now() - this.lastWelcome < 10000) {
        this.welcomed += 1
      } else {
        this.welcomed = 1
      }
      if (this.welcomed < this.welcomeString.length) {
        welcome = this.welcomeString[this.welcomed]
      } else {
        welcome = "💀"
      }
      
    }
    this.lastWelcome = Date.now()
    return welcome

  }

  async fetchYiyan() {
    if (this.yiyan === "禁用") {
      this.text = this.userDefinedText
    } else {
      let query = this.yiyan === "随机" ? "" : `?c=${this.yiyan}`
      const resp = await mkRequest(["GET", "https://international.v1.hitokoto.cn" + query])
      const info: any = JSON.parse(resp.content)
      this.text = info.hitokoto
    }
  }

  closeModal() {
    ipcRenderer.send("hide-viewer")
  }
}
</script>


<style scoped>
.app-main {
  position: relative;
  width: 400px;
  height: 600px;
}

.cover {
  background-color: rgba(122, 122, 122, 0.3);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.close-btn {
  cursor: pointer;

  position: absolute;
  top: 10px;
  right: 10px;
}

.sentence {
  width: 100%;
  position: absolute;
  bottom: 0;
  min-height: 100px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(200, 200, 200, 0.7);
  color: #333333;
  text-align: center;

  font-size: 26px;
  font-family: qitifanti;
  font-weight: bold;
  text-shadow: 0 0 10px lightblue, 0 0 20px lightcyan, 0 0 40px lightcyan, 0 0 80px lightgreen;	

}

.sentence::after {
    -webkit-filter: blur(20px);
    -moz-filter: blur(20px);
    -ms-filter: blur(20px);
    -o-filter: blur(20px);
    filter: blur(20px);
}
</style>