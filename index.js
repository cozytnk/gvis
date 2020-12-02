
/**
 * vis.js の DataSet, Network の定義．
 * NOTE: Vueインスタンスの$dataとして持つと，update時等に不具合が生じやすいため
 *       grobal に定義する．
 */

const visnetwork = {
  data: {
    nodes: new vis.DataSet(),
    edges: new vis.DataSet(),
  },
  network: null,
}

// NOTE: nodes = new vis.DataSet() 完了を待たないと？ network に紐づかない
setTimeout(() => visnetwork.network = new vis.Network(document.querySelector('#network'), visnetwork.data, {}))

// DEBUG:
visnetwork.data.nodes.on('*', (event, properties, senderId) => {
  console.log([`@nodes.on`, event, properties, senderId])
})
visnetwork.data.edges.on('*', (event, properties, senderId) => {
  console.log([`@edges.on`, event, properties, senderId])
})

// DEBUG:
setTimeout(() => {
  visnetwork.data.nodes.update([
    { id: 'hoge', label: 'Hoge' },
    { id: 'fuga', label: 'Fuga' },
    { id: 'kao', label: '（・ω・`）', title: 'tooltip of id:kao', chosen: true },
  ])
  visnetwork.data.edges.update([
    { id: 'hoge>fuga', label: 'H->F', from: 'hoge', to: 'fuga' },
    { id: 'fuga>hoge', label: 'F->H', from: 'fuga', to: 'hoge', arrows: 'to' },
  ])
})



/**
 * vue app
 */

// REF: https://waino.hateblo.jp/entry/2018/10/22/115853 > 余談 v-modelを複数指定したい場合
//      https://jp.vuejs.org/v2/guide/components-custom-events.html > 例えばキャメルケース(camelCase)のイベント名でイベントを発火した場合
//      https://qiita.com/simezi9/items/c27d69f17d2d08722b3a
Vue.component('file-panel', {
  template: `<div>
    <select class="text" v-model="_fileType">
      <option value="json">type: json</option>
      <option value="csv" disabled>type: csv</option>
    </select>
    <select class="text" v-model="_encoding">
      <option value="utf8">encoding: utf8</option>
      <option value="sjis">encoding: sjis</option>
    </select>
    <input-file accept="text/plain, .csv, .tsv, .ttl, .xlsx" @change="$emit('open', $event)" />
  </div>`,
  props: [ 'fileType', 'encoding' ],
  computed: {
    _fileType: {
      get () { return this.fileType },
      set (value) { this.$emit('update:file-type', value) },
    },
    _encoding: {
      get () { return this.encoding },
      set (value) { this.$emit('update:encoding', value) },
    },
  },
})


const app = new Vue({
  el: '#app',
  data: {
    options: {
      // NOTE: v-modelで指定した範囲は予め明示的に定義すべし
      physics: { enabled: true },
      layout: {
        hierarchical: { enabled: false },
      },
      interaction: {
        multiselect: true,
      },
    },
    numOfNodes: -1,
    numOfEdges: -1,
    file: { fileType: 'json', encoding: 'utf8' },
  },
  computed: {
  },
  watch: {
    options: {
      handler () {
        console.log(`@app.watch.options`)
        visnetwork.network.setOptions(this.options)
      },
      deep: true
    },
  },
  mounted () {
    visnetwork.data.nodes.on('*', () => this.numOfNodes = visnetwork.data.nodes.length)
    visnetwork.data.edges.on('*', () => this.numOfEdges = visnetwork.data.edges.length)
    setTimeout(() => {
      visnetwork.network.setOptions(this.options)
      visnetwork.network.on('select', props => {
        console.log([ `@network.on(select)`, props ])
      })
    })
  },
  methods: {
    async debug () {
      console.log(`@app.debug`)
      visnetwork.data.nodes.update([
        { id: 'test', label: 'Test' },
      ])
      visnetwork.data.nodes.update([
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
      ])
      visnetwork.data.edges.update([
        { id: '2222', label: '222', from: 'test', to: 'b' },
        { id: '1111', label: '111', from: 'hoge', to: 'hoge' },
      ])
    },
    clear () {
      visnetwork.data.nodes.clear()
      visnetwork.data.edges.clear()
    },
    async openFiles (files) {
      console.log([ `@app.openFiles`, files ])
      for (const file of files) {
        // const ext = file.name.match(/\.(?<ext>[^\.]*)$/i)?.groups.ext.toLowerCase()
        const content = await readFile(file, { as: 'Text', encoding: this.file.encoding })
        const data = JSON.parse(content)
        visnetwork.data.nodes.update(data.nodes)
        visnetwork.data.edges.update(data.edges)
      }
    },
  },
})
