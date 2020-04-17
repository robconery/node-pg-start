/*****************************************************
*  project: vue nouislider                           *
*  description: a Vue component for noUiSlider       *
*  author: horans@gmail.com                          *
*  url: github.com/horans/vue-nouislider             *
*  update: 180727                                    *
*****************************************************/
/* global Vue, noUiSlider */

/* nouislider */
Vue.component('v-nus', {
  template: '<div :id="\'vue-nouislider-\' + id"></div>',
  props: {
    'id': {
      type: String,
      default: function () {
        // stackoverflow.com/questions/10726909/
        return Math.random().toString(36).substr(2, 4)
      }
    },
    'config': Object,
    'value': Array,
    'log': Boolean
  },
  data: function () {
    return {
      init: false
    }
  },
  computed: {
    slider: function () {
      return document.getElementById('vue-nouislider-' + this.id)
    }
  },
  mounted: function () {
    var vnus = this
    vnus.config.start = vnus.value
    noUiSlider.create(vnus.slider, vnus.config)
    vnus.slider.noUiSlider.on('update', function (values, handle) {
      vnus.$emit('update', values)
      if (vnus.log) window.console.log('[vnus]<' + handle + '>' + values)
    })
  },
  watch: {
    'value': function (nv) {
      if (this.init) {
        var nus = this.slider.noUiSlider.get()
        if (!Array.isArray(nus)) nus = [nus]
        if (JSON.stringify(nus) !== JSON.stringify(nv)) this.slider.noUiSlider.set(nv)
      } else {
        this.init = true
      }
    }
  }
})