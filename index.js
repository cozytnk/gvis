

Vue.component('network', {
  template: `<div ref="network" class="network"></div>`,
  props: [ 'data', 'options' ],
  data () {
    return {
      network: null,
    }
  },
  watch: {
    options: {
      handler () {
        console.log(`@network.watch.options`)
        this.network.setOptions(this.options)
      },
      deep: true
    },
  },
  mounted () {
    console.log(`@network.mounted`)
    // this.network = new vis.Network(this.$refs.network, this.data, this.options) // NOTE: $dataとしてnetworkインスタンスを持つと，描画されず，$dataに保持もされない
    // const network = new vis.Network(this.$refs.network, this.data, this.options) // NOTE: 描画されるが，$dataで保持できない
    setTimeout(() => {
      console.log(`@network.mounted > setTimeout`)
      this.network = new vis.Network(this.$refs.network, this.data, this.options)
      console.log(this.network)
      window.a = this.network
    }, 1)
  },
})


const app = new Vue({
  el: '#app',
  data: {
    data: {
      nodes: new vis.DataSet(), // [{id: s_or_o, label: XXX, ... }, ...]
      edges: new vis.DataSet(), // [{id: s->p->o, label: p, from: s, to: o, s: XXX, p: XXX, o: XXX, ... }, ...]
    },
    options: {
      // NOTE: v-modelで指定した範囲は定義すべし
      physics: { enabled: true },
      layout: {
        hierarchical: { enabled: false },
      },
    },
  },
  computed: {
    numOfNodes () { return this.data.nodes.length },
    numOfEdges () { return this.data.edges.length },
  },
  mounted () {},
  methods: {
    debug () {
      console.log(`@app.debug`)
      this.data.nodes.update([
        { id: 'test', label: 'Test' },
      ])
    },
  },
})





app.data.nodes.update([
  { id: 'hoge', label: 'Hoge' },
  { id: 'fuga', label: 'Fuga' },
  { id: 'kao', label: '（・ω・`）' },
])
app.data.edges.update([
  { id: 'hoge>fuga', label: 'H>F', from: 'hoge', to: 'fuga' },
  { id: 'fuga>hoge', label: 'F>H', from: 'fuga', to: 'hoge' },
])

app.data.nodes.on('*', (event, properties, senderId) => {
  // app.numOfNodes // app.computed.numOfNodesを発火 // しなくても更新された
})
