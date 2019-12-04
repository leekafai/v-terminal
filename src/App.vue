<template>
  <section>
    <label for="cmd">
      <div id="terminal" @keyup.space="focus">
        <div id="output">
          <div class="output_message" v-for="msg in output" :key="msg">
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
            v-model="content"
            @keydown.left="arrow_l"
            @keydown.right="arrow_r"
            @keyup.up="arrow_u"
            @keyup.down="arrow_d"
            @keydown.delete="editvis"
            @keydown.esc="blur"
            @keyup="keypress"
            @keypress.enter="submit"
            @blur="active=0"
            v-bind:disabled="!input_enable"
            v-focus
          />
          <span class="prompt" ref="prompt">USER&nbsp;</span>
          <div id="vo" v-bind:class="active?'active':''" v-if="content_n">
            <div
              v-for="item in content_n"
              style="letter-spacing: 2px;overflow:hidden;"
              :key="item"
            >{{item}}</div>
          </div>
          <span
            class="content"
            v-bind:class="active?'active':''"
            v-html="content_before"
            ref="ctx1"
          ></span>
          <span
            v-bind:class="input_enable?'':'error'"
            class="cursor"
            v-html="cursor_text"
            ref="cursor"
          ></span>
          <span class="content" v-html="content_after" ref="ctx2"></span>
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
      pos: null,
      content: "",
      content_after: "",
      cursor_text: "",
      content_before: "",
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
  watch: {
    content: {
      handler() {
        console.log(this.doGetCaretPosition(this.cmdDOM));
      }
    }
  },
  methods: {
    arrow_l: function() {
      console.log("arrow_left");
      var cursor_l = this.content.length;
      // this.pos = this.cmdDOM.caret();
      this.pos = this.doGetCaretPosition(this.cmdDOM);
      this.editvis();
    },
    arrow_r: function() {
      console.log("arrow_right");
      var cursor_l = this.content.length;
      // this.pos = this.cmdDOM.caret();
      this.pos = this.doGetCaretPosition(this.cmdDOM);
      // console.log(this.pos + "/" + cursor_l)
      this.editvis();
      // console.log(this.content_before)
      // console.log("|")
      // console.log(this.content_after)
    },
    arrow_u: function(event) {
      var step = ++this.historyStep;
      console.log(step + ":" + this.history.length);
      if (this.history.length > 0) {
        if (this.history.length >= step) {
          this.content = this.history[this.history.length - step];
          this.pos = this.content.length;
          this.editvis();
        } else {
          // 当前向上遍历到最早的一条
          console.warn("top now");
          console.log(this.historyStep);
        }
      } else {
        console.warn("no history");
      }
    },
    arrow_d: function(event) {
      var step = Math.abs(--this.historyStep);
      console.log(step + ":" + this.history.length);
      if (this.history.length > 0 && this.history.length - step >= 1) {
        if (this.history.length >= step) {
          this.content = this.history[this.history.length - step];
          console.log("~~" + this.history[this.history.length - step]);
          this.pos = this.content.length;
          this.editvis();
          console.log(this.content + "//" + this.content.before);
          console.log("1=" + this.pos);
          // console.log("2=" + this.cmdDOM.caret());
          console.warn(this.content.length);

          // console.log("3=" + this.cmdDOM.caret());
          console.log("4=" + this.pos);
          console.log("h:" + this.history);
          console.log("prv" + this.content);
        } else {
          // 当前向上遍历到最早的一条
          console.warn("top now");
          this.historyStep = 0;
          step = 0;
        }
      } else {
        console.warn("no history");
      }
    },
    format_output: function() {
      if (this.output.length > 30) {
        var sublength = this.output.length - 30;
        this.output.splice(0, sublength);
      }
    },
    doGetCaretPosition(oField) {
      // Initialize
      var iCaretPos = 0;

      // IE Support
      if (document.selection) {
        // Set focus on the element
        oField.focus();

        // To get cursor position, get empty selection range
        var oSel = document.selection.createRange();

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
    historySelect: function() {
      // var step = ++this.historyStep
      // prev = function () {
      //     return this.history[this.history.length - step - 1]
      // }
      // return prev
      // console.log('prv' + prev)
    },

    submit: function() {
      if (this.commend(this.content)) {
        console.warn("commend");
      } else {
        if (this.content) {
          var message = { prompt: "USER", content: this.xss(this.content) };
          this.output.push(message);
          this.format_output();
          this.historySet(message);
        }
      }
      console.log(this.output);
      this.content = "";
      this.content_n.length = 0;
      this.editvis();
    },
    keypress: function() {
      console.log("keypress");
      var cursor_l = 0;
      // this.pos = this.cmdDOM.caret();
      this.pos = this.doGetCaretPosition(this.cmdDOM);
      if (this.content) {
        cursor_l = this.content.length;
      }
      this.editvis();

      console.log(this.pos + "/" + cursor_l);
      console.log(this.content_before);
      console.log(this.cursor_text);
      console.log(this.content_after);
    },
    commend: function(str) {
      var allow = 0;
      if (!str) {
        return 0;
      }
      switch (str) {
        case "help":
          allow = 1;
          this.output.push({ prompt: "HELP", content: "commend:help,clean,github" });
          break;
        case "clean":
          allow = 1;
          this.output.length = 0;
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
    editvis: function() {
      console.log(this.pos);
      var count = 0;
      var linelim = 20;
      // const a = this.$refs.commend.offsetWidth;
      // const b = this.$refs.prompt.offsetWidth;
      // c = this.$refs.ctx1.offsetWidth;
      // d = this.$refs.cursor.offsetWidth;
      // e = this.$refs.ctx2.offsetWidth;
      if (this.content_n.length > 0) {
        // 换行后
        if (this.content_before.length > linelim) {
          // 没有空间了
          this.content_n.push(this.content_before);
          this.content_before = "";
        }
        this.content_n.map(function(str) {
          const num = str.length;
          count += num;
        });
        if (this.pos == this.content.length) {
          this.content_after = "";
          this.cursor_text = "";
          this.content_before = this.xss(this.content.substr(count));
        } else {
          // pos<cursor_l
          this.content_after = this.xss(this.content.substr(this.pos + 1));
          this.cursor_text = this.xss(this.content.substr(this.pos, 1));
          this.content_before = this.xss(
            this.content.substr(count, this.pos - count)
          );
        }
      } else {
        // 未换行

        if (this.pos == this.content.length) {
          this.content_after = "";
          this.cursor_text = "";
          this.content_before = this.xss(this.content);
        } else {
          // pos<cursor_l
          this.content_after = this.xss(this.content.substr(this.pos + 1));
          this.cursor_text = this.xss(this.content.substr(this.pos, 1));
          this.content_before = this.xss(this.content.substr(0, this.pos));
        }
        if (this.content.length > linelim) {
          // 没有空间了
          this.content_n.push(this.content_before);
          this.content_before = "";
        }
      }
    },
    xss: function(str) {
      str = str.replace(/</g, "&lt;");
      str = str.replace(/>/g, "&gt;");
      str = str.replace(/\s/g, "&nbsp;");
      return str;
    },
    historySet: function(message) {
      this.history.push(message.content);
      this.historyStep = this.history.length;
    },
    blur: function() {
      this.cmdDOM.blur();
    },
    focus: function(message, event) {
      this.cmdDOM.focus();
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.cmdDOM = document.querySelector("#cmd");
      // this.pos = this.cmdDOM.caret();
      this.pos = this.doGetCaretPosition(this.cmdDOM);
    });
  }
};
</script>
<style lang="scss" scoped>
input[type="text"] {
  opacity: 0;
  position: absolute;
  width: 0.1px;
  padding: 0;
  margin: 0;
}
body {
  margin: 0;
  background: rgba(37, 37, 37, 0.85);
  font-family: "Consolas", Helvetica, Arial, sans-serif, monospace, "Segoe UI";
}
#commend {
  width: 100%;
  float: left;
  line-height: 30px;
  min-height: 30px;
  display: block;
  & #vo {
    width: 100%;
  }
  & span {
    float: left;
    &.content {
      //  overflow: hidden;
      letter-spacing: 2px;
    }
    &.active {
      & ~ .error {
        content: "...";
        background: #a71d5d !important;
      }
      & ~ .cursor {
        min-width: 4px;
        height: 20px;
        position: relative;
        background: #969896;
        color: #002b36;
        box-shadow: 0 0 5px #93a1a1;
        text-align: center;
        word-spacing: 3px;
        animation: cursor 0.9s infinite linear;
        line-height: 20px;
        margin: 5px 2px;
        display: block;
      }
    }
    &.prompt {
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
  .prompt,
  .content {
    float: left;
  }
  .prompt {
    margin: 0 3px;
    &:after {
      content: "$";
    }
  }
  .content {
    // overflow: hidden;
    letter-spacing: 2px;
    display: block;
    animation: return 0.3s;

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