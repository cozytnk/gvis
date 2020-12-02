Vue.component('input-file', {
  template: `
    <label
      class="button"
      tabindex="0"
      draggable="true"
      @dragover="$event.preventDefault()"
      @drop="$event.preventDefault(); change($event.dataTransfer.files)"
    >
      <input type="file" style="display: none;" :accept="accept" @change="change($event.target.files); $event.target.value = ''">
      open file
    </label>`,
  props: [ 'accept' ],
  methods: {
    change (files) {
      console.log(`@input-file.change`)
      this.$emit('change', files)
    },
  },
})


const readFile = (file, options={ as: 'Text', encoding: 'utf8' }) => {
  // REF: https://www.yscjp.com/doc/async_async_attack.html 5-2-1.
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)

    if (options?.as === 'Text') {
      reader.readAsText(file, options?.encoding || 'utf8')
    }
    else if (options?.as === 'ArrayBuffer') {
      reader.readAsArrayBuffer(file)
    }
    else {
      reject(Error(`invalid options.`))
    }
  })
}


const parser = {
  parseCSVString (csvString, delimiter=',', commentString='//') {
    const data = []
    csvString = csvString.replace(/\r?/g, '') // fix invalid characters
    let lines = csvString.split('\n')

    const header = lines.shift() // pop first element

    for (let line of lines) {
      line = line.trim()
      if (line.startsWith(commentString)) continue
      if (line === '') continue
      const elems = line.split(delimiter)
      let row = {}
      for (const i in header) row[header[i]] = elems[i]
      data.push(row)
    }
    return data
  },

  parseTTLString (ttlString, commentString='//') {
    const data = []
    ttlString = ttlString.replace(/\r?/g, '') // fix invalid characters
    const lines = ttlString.split('\n')

    for (let line of lines.length) {
      line = line.trim()
      if (line.startsWith(commentString)) continue
      if (line == '') continue
      if (line.startsWith('PREFIX')) continue // TODO:

      const result = line.match(/^(.+?) (.+?) (.+?) \.$/g)
      data.push([result[1], result[2], result[3]])
    }
    return data
  },

}


