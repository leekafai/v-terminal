<template>
  <section>
    <label for="cmd">
      <div id="terminal" @keyup.space="focus">
        <div id="output">
          <div class="output_message" v-for="(msg,index) in output" :key="index">
            <div class="output_skin">
              <a class="prompt" v-if="msg.prompt" v-text="`${msg.prompt}`"></a>
              <a
                class="content"
                v-bind:class="msg.class"
                v-html="msg.content.replace(/\s/g,'&nbsp;')"
              ></a>
              <div class="cleaner"></div>
            </div>
          </div>

          <div class="cleaner"></div>
        </div>
        <div id="commend" @click="active=1" ref="commend">
          <input
            type="text"
            id="cmd"
            v-model="input_text"
            @keydown.left.prevent.stop="arrow_l"
            @keydown.right.prevent.stop="arrow_r"
            @keyup.up.prevent.stop="arrow_u"
            @keyup.down.prevent.stop="arrow_d"
            @keydown.delete="deleteEvent"
            @keydown.esc="blur"
            @keyup="keypress"
            @keypress.enter="submit"
            @blur="active=0"
            v-bind:disabled="!input_enable"
          />
          <span class="prompt" ref="prompt">USER&nbsp;</span>
          <!-- <div id="vo" v-bind:class="active?'active':''" v-if="content_n"> -->
          <div style="width:100%;word-break:break-all;">
            <p id="vo" class="content active">
              <strong>{{input_render_text[0]||''}}</strong>
              <strong v-bind:class="input_enable?'':'error'" class="cursor" ref="cursor">
                <b class="cursor_text" v-html="input_render_text[1]||''"></b>
              </strong>
              <strong>{{input_render_text[2]||''}}</strong>
            </p>
          </div>

          <div class="cleaner"></div>
        </div>
        <div class="cleaner"></div>
      </div>
    </label>
  </section>
</template>
<script>
export default {
  data() {
    return {
      cmdDOM: null,
      active: 0,
      // pos: null,
      history_pointer: 0,
      input_text: "",
      input_render_text: [""],
      output: [
        {
          prompt: "",
          content: "Welcome<br>But i`m not ready for work right now;",
          class: "upcase welcome goblind"
        }
      ],
      history: [],
      input_enable: 1,
      historyStep: 0,
      content_n: []
    };
  },
  computed: {
    pos: {
      get() {
        return this.doGetCaretPosition(this.cmdDOM);
      },
      set(val) {
        console.log("new pos", val);
        const nowPos = this.doGetCaretPosition(this.cmdDOM);
        console.log(nowPos, "nowPos");
        this.cmdDOM.setSelectionRange(val, val);
      }
    }
  },
  watch: {
    output: {
      handler() {
        this.historyStep = 0;
      }
    },
    input_text: {
      handler() {
        console.log(this.doGetCaretPosition(this.cmdDOM));
      }
    }
  },
  methods: {
    arrow_l: function() {
      console.log("arrow_left", this.doGetCaretPosition(this.cmdDOM));
      const pos = Math.max(this.doGetCaretPosition(this.cmdDOM) - 1, 0);
      console.log(pos, "pos left");
      this.pos = pos;
      this.inputRender();
    },
    arrow_r: function() {
      console.log("arrow_left", this.doGetCaretPosition(this.cmdDOM));
      const pos = Math.max(this.doGetCaretPosition(this.cmdDOM) + 1, 0);
      console.log(pos, "pos left");
      this.pos = pos;
      this.inputRender();
    },
    deleteEvent() {
      this.inputRender();
    },
    contentParseRender(content, cursor) {
      // console.log(content, cursor, "content, cursor");
      const render_text = [];
      if (content && content.length === 0) {
        this.content_n = [];
        render_text.push("");
      } else {
        // console.log("has something", cursor, content);
        if (cursor < content.length) {
          // console.log(cursor, content.length);
          // console.log(content.substr(0, cursor));
          render_text.push(this.xss(content.substr(0, cursor)));
          render_text.push(this.xss(content.substr(cursor, 1)));
          render_text.push(this.xss(content.substr(cursor + 1)));
        } else {
          render_text.push(this.xss(content));
        }
      }
      this.$set(this, "input_render_text", render_text);
      // this.pos = this.input_render_text[0].length;
      // console.log("contentParseRender", this.input_render_text);
    },
    inputRender(data = {}) {
      console.log(data, "inputRender data");
      const {
        input = {},
        cursor_position = this.doGetCaretPosition(this.cmdDOM)
      } = data;
      const { content = this.input_text } = input;

      // console.log(content, "content");
      let postion = !isNaN(cursor_position) ? cursor_position : content.length;
      // console.log(postion, "postion", cursor_position, content.length);
      // this.content = content;
      // this.cmdDOM.setSelectionRange(postion, postion);
      this.pos = postion;
      // console.log(postion, content);
      this.contentParseRender(content, postion);
    },

    arrow_u: function(e) {
      console.log(e, "eeee");
      let input_text = "";
      if (this.history[0]) {
        console.log(this.history_pointer, "historyStep");
        console.log(this.history);
        if (this.history_pointer === 0) {
          input_text = this.history[0];
        } else if (this.history_pointer > this.history.length - 1) {
          this.history_pointer = 0;
          input_text = this.history[0];
        } else {
          input_text = this.history[this.history_pointer];
        }
      } else {
        console.warn("no history");
      }
      e.preventDefault();
      e.stopPropagation();
      console.log(input_text, "input_text");
      this.input_text = input_text;
      this.inputRender({
        input: { content: input_text },
        cursor_position: input_text.length
      });

      this.history_pointer++;
    },
    arrow_d: function(e) {
      let step = Math.abs(--this.historyStep);
      console.log(step + ":" + this.history.length);
      if (this.history.length > 0 && this.history.length - step >= 1) {
        if (this.history.length >= step) {
          this.input_text = this.history[this.history.length - step];
          console.log("~~" + this.history[this.history.length - step]);
          // this.pos = this.input_text.length;
          // this.editvis();
          console.log(this.input_text + "//" + this.input_text.before);
          // console.log("1=" + this.pos);
          // console.log("2=" + this.cmdDOM.caret());
          console.warn(this.input_text.length);

          // console.log("3=" + this.cmdDOM.caret());
          // console.log("4=" + this.pos);
          console.log("h:" + this.history);
          console.log("prv" + this.input_text);
        } else {
          // 当前向上遍历到最早的一条
          console.warn("top now");
          this.historyStep = 0;
          step = 0;
        }
      } else {
        console.warn("no history");
        e.preventDefault();
        e.stopPropagation();
      }
    },
    format_output: function() {
      if (this.output.length > 30) {
        let sublength = this.output.length - 30;
        this.output.splice(0, sublength);
      }
    },
    doGetCaretPosition(oField) {
      // Initialize
      let iCaretPos = 0;

      // IE Support
      if (document.selection) {
        // Set focus on the element
        oField.focus();

        // To get cursor position, get empty selection range
        let oSel = document.selection.createRange();

        // Move selection start to 0 position
        oSel.moveStart("character", -oField.value.length);

        // The caret position is selection length
        iCaretPos = oSel.text.length;
      }

      // Firefox support
      else if (oField.selectionStart || oField.selectionStart == "0")
        iCaretPos = oField.selectionStart;

      // Return results
      return iCaretPos;
    },
    submit: function() {
      if (this.commend(this.input_text)) {
        console.warn("commend");
      } else {
        if (this.input_text) {
          let message = { prompt: "USER", content: this.xss(this.input_text) };
          this.output.push(message);
          this.format_output();
          this.historySet(message);
        }
      }
      console.log(this.output);
      this.content_n.length = 0;
      this.input_text = "";
      this.inputRender({
        input: { content: "" },
        cursor_position: 0
      });
    },
    keypress(e) {
      // console.log("keypress");
      // let cursor_l = 0;
      // this.pos = this.cmdDOM.caret();
      // this.pos = this.doGetCaretPosition(this.cmdDOM);
      // if (this.input_text) {
      //   cursor_l = this.input_text.length;
      // }
      console.log(e.code);
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "Enter"].includes(e.code)) {
        this.inputRender({ input: { content: this.input_text } });
      }
      // console.log(this.pos + "/" + cursor_l);
      // console.log("content_before", this.content_before);
      // console.log("cursor_text", this.cursor_text);
      // console.log("content_after", this.content_after);
    },
    commend: function(str) {
      let allow = 0;
      if (!str) {
        return 0;
      }
      switch (str) {
        case "help":
          allow = 1;
          this.output.push({
            prompt: "HELP",
            content: "commend:help,clean,github"
          });
          break;
        case "clean":
          allow = 1;
          this.output.length = 0;
          break;
        case "reboot":
          allow = 1;
          this.output.length = 0;
          this.history.length = 0;
          this.history_pointer = 0;
          break;
        case "github":
          allow = 1;
          this.output.push({
            prompt: "GITHUB URL",
            content: "https://github.com/leekafai/v-terminal"
          });
          break;
      }
      return allow;
    },
    xss: function(str) {
      str = str.replace(/</g, "&lt;");
      str = str.replace(/>/g, "&gt;");
      str = str.replace(/\s/g, "&nbsp;");
      return str;
    },
    historySet: function(message) {
      this.history.push(message.content);
      this.history_pointer = this.history.length - 1 || 0;
    },
    blur: function() {
      this.cmdDOM.blur();
    },
    focus: function() {
      this.cmdDOM.focus();
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.cmdDOM = document.querySelector("#cmd");
      // this.pos = this.cmdDOM.caret();
      // this.pos = this.doGetCaretPosition(this.cmdDOM);
    });
  }
};
</script>
<style lang="scss">
@import "@/scss/index.scss";
body {
  margin: 0;
  background: $black;
  font-family: "Consolas", Helvetica, Arial, sans-serif, monospace, "Segoe UI";
}
</style>
<style lang="scss" scoped>
@import "@/scss/index.scss";
input[type="text"] {
  opacity: 0;
  position: absolute;
  width: 0.1px;
  padding: 0;
  margin: 0;
}
// input[type="text"] {
//   opacity: 1;
//   position: absolute;
//   width: 100px;
//   padding: 0;
//   margin: 0;
// }
#commend {
  width: 100%;
  float: left;
  line-height: 30px;
  min-height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  & #vo {
    margin: 0;
    padding-left: 10px;
    strong {
      font-weight: 100;
    }
    &.active {
      & > .error {
        content: "...";
        background: #a71d5d !important;
      }
      & > .cursor {
        min-width: 12px;
        padding: 0 1px;
        height: 30px;
        position: relative;
        line-height: 30px;
        flex-direction: column;
        justify-content: center;
        & .cursor_text {
          min-width: 1px;
          font-weight: 300;
          background: #969896;
          color: #002b36;
          box-shadow: 0 0 5px #93a1a1;
          text-align: center;
          word-spacing: 3px;
          animation: cursor 0.9s infinite linear;
          height: 20px;
          line-height: 20px;
          padding: 0 2px;
        }
      }
    }
  }
  & span {
    // float: left;
    height: 30px;
    &.content {
      //  overflow: hidden;
      letter-spacing: 2px;
      min-width: 1px;
    }

    &.prompt {
      display: flex;
      justify-content: flex-start;
      flex-direction: row;
      &:after {
        content: ">";
        color: tomato;
        font-family: "Consolas", monospace;
        display: inline-block;
        position: relative;
        transform-origin: center;
        animation-fill-mode: forwards;
        transform: rotateZ(0deg);
      }
    }
  }
}

.output_message {
  width: 100%;
  float: left;
  line-height: 30px;
  min-height: 30px;
}

.output_skin {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  .prompt {
    margin-right: 1rem;
    color: $black6;
    &:after {
      content: ">";
    }
  }
  .content {
    // overflow: hidden;
    letter-spacing: 2px;
    display: block;
    animation: return 0.3s;
    word-break: break-all;
    // animation: insertani 2s steps(100, end);
  }
}
#terminal {
  color: rgb(189, 227, 238);
  min-height: 300px;
  width: 50%;
  min-width: 300px;
  padding: 10px 0;
  margin: 0 auto;
  text-shadow: 0 0 5px #93a1a1;
  & *::selection {
    background: #49545f;
    color: #a4a9ae;
  }
}
.cleaner {
  clear: both;
}
.welcome {
}
.upcase {
  text-transform: uppercase;
}

@keyframes cursor {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
  }
}
@keyframes return {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

@keyframes insertani {
  //from { width: 0; }
  0% {
    width: 0;
  }
  10% {
    width: 15%;
  }
  20% {
    width: 25%;
  }
  30% {
    width: 35%;
  }
  40% {
    width: 45%;
  }
  50% {
    width: 55%;
  }
  60% {
    width: 65%;
  }
  //  70%{width:75%;}
  //  80%{width:85%;}
  //   90%{width:95%;}
  100% {
    width: 80%;
  }
}
.cleaner {
  clear: both;
}
#hook-arguments-example {
  height: 200px;
}
</style>