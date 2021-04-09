<template>
  <div class="hello">
    <h2>Twitch Poll Generator</h2>
    <form @submit.prevent="connect()">
      <div class="form-row">
        <div class="form-group col-md-12">
          <label for="canal">Channel</label>
          <input type="text" v-model="poll.channel" class="form-control" id="channel" placeholder="Channel" required :disabled="connected">
        </div>
      </div>
      <p>Replys</p>
      <div class="form-row">
        <div class="form-group col-md-12" v-for="(reply, index) in poll.replys" :key="index">
          <input type="text" class="form-control" v-model="poll.replys[index]" :id="'reply' + index" :placeholder="'Reply ' + (index + 1)" :disabled="connected" v-on:keyup="inputChanged(index)">
        </div>
      </div>
      <button type="submit" class="btn" :class="{'btn-primary': !connected, 'btn-danger': connected}">{{ !connected ? 'Connect' : 'Disconnect' }}</button>
    </form>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
window.ipcRenderer = ipcRenderer

export default {
  name: 'Form',
  data() {
    return {
      poll: {
        channel: '',
        replys: [
          '',
          ''
        ]
      },
      connected: false
    }
  },
  methods: {
    async connect() {
      const filtered = this.poll.replys.filter(function (el) {
        return el != '';
      });

      this.poll.replys = filtered

      this.connected = await ipcRenderer.invoke('connect', this.poll)
    },
    inputChanged(index) {
      let length = this.poll.replys.length - 1
      if (index == length) {
        this.poll.replys.push('')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
