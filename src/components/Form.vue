<template>
  <div class="hello">
    <h2>Twitch Poll Generator</h2>
    <small class="d-block pb-3">Add the Browser scene with the URL http://localhost:3000</small>
    <form @submit.prevent="connect()">
      <div class="form-row">
        <div class="form-group col-md-12">
          <label for="canal">Channel</label>
          <input type="text" v-model="poll.channel" class="form-control" id="channel" placeholder="Channel" required :disabled="connected">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-md-12">
          <label for="question">Question</label>
          <input type="text" v-model="poll.question" class="form-control" id="question" placeholder="Question" required :disabled="connected">
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
        question: '',
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
h2 {
  margin: 0
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
