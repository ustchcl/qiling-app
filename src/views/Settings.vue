<template>
  <v-card>
    <v-app-bar style="background: #383838" dark>
      <v-toolbar-title>应用设置</v-toolbar-title>
      <v-spacer />
      <v-icon large class="close-btn" @click="closePanel"> mdi-close </v-icon>
    </v-app-bar>

    <v-sheet max-height="600">
      <v-container>
        <v-row align="center">
          <v-col cols="6">
            <div style="font-size: 18px; font-weight: bold">提醒时间🕒</div>
          </v-col>
          <v-col cols="6">
            <v-select
              :items="items"
              label="请选择出现时间"
              solo
              v-model="time"
            ></v-select>
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col cols="6">
            <div style="font-size: 18px; font-weight: bold">一言配置😎</div>
          </v-col>
          <v-col cols="6">
            <v-select
              :items="yiyanItems"
              label="一言句子类型"
              v-model="yiyan"
              solo
            ></v-select>
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col cols="6">
            <div style="font-size: 18px; font-weight: bold">
              自定义文案(禁用一言时起效)😏
            </div>
          </v-col>
          <v-col cols="6">
            <v-text-field
              label="任性的文案"
              v-model="userDefinedText"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col cols="6">
            <div style="font-size: 18px; font-weight: bold">
              开机自启动💻
            </div>
          </v-col>
          <v-col cols="6">
            <v-switch v-model="autoStart" color="success"/>
          </v-col>
        </v-row>
        <div
          style="
            width: 100%;
            margin-top: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <v-btn
            elevation="2"
            @click="saveConfig"
            style="
              width: 200px;
              height: 40px;
              font-size: 18px;
              text-align: center;
            "
            color="success"
            >保&nbsp;&nbsp;&nbsp;&nbsp;存</v-btn
          >
        </div>
        <div style="height: 35px"/>
      </v-container>
    </v-sheet>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { ipcRenderer, remote } from "electron";

@Component
export default class Settings extends Vue {
  items = [
    { text: "1分钟", value: 60, disabled: false },
    { text: "5分钟", value: 300, disabled: false },
    { text: "10分钟", value: 600, disabled: false },
    { text: "30分钟", value: 1800, disabled: false },
    { text: "1小时", value: 3600, disabled: false },
    { text: "每整点", value: -1, disabled: false },
  ];

  yiyanItems = [
    { value: "禁用", text: "禁用" },
    { value: "随机", text: "随机" },
    { value: "a", text: "动画" },
    { value: "b", text: "漫画" },
    { value: "c", text: "游戏" },
    { value: "d", text: "文学" },
    { value: "e", text: "原创" },
    { value: "f", text: "来自网络" },
    { value: "g", text: "其他" },
    { value: "h", text: "影视" },
    { value: "i", text: "诗词" },
    { value: "j", text: "网易云" },
    { value: "k", text: "哲学" },
    { value: "l", text: "抖机灵" },
  ];

  yiyan = "随机";
  time = -1;
  userDefinedText = "";
  autoStart = false

  created() {
    const query = this.$route.query;
    const time = parseInt(query["time"] as any)
    this.time = isNaN(time) ? -1 : time
    this.yiyan =  (query["yiyan"] as any)  || "随机";
    this.userDefinedText =  (query["userDefinedText"] as any)  || "";
    this.autoStart = query['autoStart'] == null ? false : (query["autoStart"] == "true")
  }

  saveConfig() {
    ipcRenderer.send(
      "save-setting",
      this.time,
      this.yiyan,
      this.userDefinedText,
      this.autoStart
    );
  }

  closePanel() {
    ipcRenderer.send("close-setting");
  }
}
</script>

<style scoped>
.close-btn {
  cursor: pointer;
}

.close-btn:hover {
  color: #5ab55e;
}
</style>