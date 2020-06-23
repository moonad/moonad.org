// The page where you write a new post

const {Component, render} = require("inferno");
const h = require("inferno-hyperscript").h;
const front = require("./../front.js");
const e = require("cors");

const body_test =
` aaaaaaaaaaa
+mymai: Bool
  Bool.true
+
mymai.pair: Pair(Bits, Bits)
  Pair.new<Bits,Bits>(Bits.0, Bits.1)
`

// error_example
/*
 +mymai.term: Bool
   0 + 1
*/

const default_title = "Title";
const default_body  = "Type your code and/or text here";

class Write extends Component {
  constructor(props) {
    super(props);
    this.cite = new URLSearchParams(window.location.search).get("cite") || "0x0000000000000000";
    this.head = default_title;
    this.body = default_body;
    this.cleared = {};
    this.display_info = false;
    this.repl = "";
  }

  async post({cite, head, body}) {
    // Checks if citation is correct
    if (!front.moonad.lib.hex(64, cite)) {
      return alert("Incorrect cited post.");
    }

    try {
      await front.moonad.api.post({cite, head, body}, front.pkey);
      window.history.back();
    } catch (e) {
      console.log(e);
      alert(front.remove_colors(e));
    }
  }

  async update_repl_content(content) {
    const terms_aux = (aux, term) => aux +"\n✓ "+ term[0]+":"+term[1];
    var terms_formatted  = "";
    var errors_formatted = "";
    try {
      var {terms, errors}   = await front.check_block_code(content);
      if (terms.length > 0){
        terms_formatted = terms.map(info => "✓ "+ info[0]+": "+info[1]+"\n");
      }
      if (errors.length > 0){
        errors_formatted = "\nErrors:\n";
        errors_formatted += errors.map(info => info[0]+": "+info[1]+"\n");
      } else {
        terms_formatted += "\nAll terms checked!";
      }
    } catch (e) {
      errors_formatted += e; // TODO: is a string but to not print as one. Check with error_example
    }
    this.repl = terms_formatted + errors_formatted;
    this.forceUpdate();
  }

  click(key, elem) {
    if (!this.cleared[key]) {
      this.cleared[key] = true;
      elem.innerText = "";
      this.forceUpdate();
    }
  }

  keyPressed(e){
    if(this.body && e.key === "Enter"){
      this.update_repl_content(this.body);
      this.forceUpdate();
    }
  }

  refresh(key, elem) {
    this[key] = elem.innerText;
    this.forceUpdate();
  }

  render() {

    const info_view = h("div", {
      style: {
        "width": "300px",
        "height": "150px",
        "margin-top": "3px",
        "background": "white",
        "z-index": "8",
        "font-size": "10px",
        "padding": "10px",
        "border": "solid 1px #D6D6D6",
      }, onMouseLeave: () => this.display_info = false
     },[
        h("p", {}, "Style your code using '+':"),
        h("br"),
        h("pre", {style: {"color": "rgb(150, 150, 150)"}}, [
          h("p", {}, "+your_name.foo: Type"),
          h("p", {}, "  code"),
          h("p", {}, "+ // next function in the same block of code"),
          h("p", {}, "your_name.bar: Type"),
          h("p", {}, "  code")
        ])
     ]);
    
    const info_button = h("div", {
      style: {
        "display": "flex", 
        "flex-direction": "column",
        "align-items": "flex-end",
        "margin-right": "5px",
        "margin-top": "3px",
      },
    } , [
      h("div", {
        style: {
          "text-decoration": "underline",
          "cursor": "pointer",
          "color": "rgb(101,102,105)",
        },
        onClick: () => this.display_info = !this.display_info
      }, "?"),
      this.display_info ? info_view : h("span")
    ]);

    const title_div = h("div", {
      style: {
        "margin": "20px 60px 10px 60px",
        "display": "flex",
        "flex-flow": "row nowrap",
        "justify-content": "space-between",
        "height": "20px",
      }
    }, [ 
      h("div", { 
        style: { "color": "rgb(0, 63, 99)", "font-size": "15px"}
      }, "Replying to "+ this.cite),
      info_button
    ]);

    const def_input_text_style = {
      "color": "rgb(211,211,211)"
    }

    const input_text_style = {
      "color": "rgb(105,105,105)",
    }

    const head = h("pre", {
      contentEditable: true,
      style: {
        ... this.head === default_title ? def_input_text_style : input_text_style,
        "font-family": "IBMPlexMono-Light",
        "font-size": "12px",
        "outline": "none",
        "width": "100%",
        "height": "30px",
        "padding": "8px 10px 8px 60px",
        "border-bottom": "1px solid rgb(240,240,240)"
      },
      onClick: (e) => this.click("head", e.target),
      onInput: (e) => this.refresh("head", e.target),
    }, [this.head]);

    const body = h("pre", {
      contentEditable: true,
      style: {
        ... this.body === default_body ? def_input_text_style : input_text_style,
        "font-family": "IBMPlexMono-Light",
        "font-size": "12px",
        "outline": "none",
        "width": "100%",
        "height": "360px",
        "padding": "8px 10px 8px 60px",
        "overflow-y": "scroll",
      },
      onClick: (e) => this.click("body", e.target),
      onInput: (e) => this.refresh("body", e.target),
      onKeyPress: (e) => this.keyPressed(e)
    }, [this.body]);

    const send = h("span", {
      style: {
        "outline": "none",
        "height": "20px",
        "padding": "2px 4px",
        "text-decoration": "underline",
        "cursor": "pointer",
      },
      onClick: () => {
        var cite = this.cite;
        if (this.head === "Title..." || this.body === "Contents...") {
          alert("Write something first!");
        } else {
          var head = this.head.replace(/\n/g,"");
          var body = this.body.replace(/\n{3,}/g, "\n\n");
          this.post({cite, head, body});
        };
      },
    }, "Submit");

    const buttons = h("div", {
      style: {
        "font-family": "IBMPlexMono-Light",
        "font-size": "12px",
        "color": "rgb(101,102,105)",
        "height": "20px",
        "display": "flex",
        "flex-direction": "row",
        "justify-content": "flex-end",
        "margin": "20px 60px"
      }
    }, [send]) // TODO: add preview

    const repl = h("div", { 
      style: {
        // "height": "calc(100% - 20px - 20px - 360px)",
        "color": "white",//"rgb(101,102,105)",
        "background": "rgb(66,64,64)",//"rgb(221,222,224)",
        // "border-top": "1px solid rgb(201,202,204)",
        "padding": "4px 4px",
        "word-wrap": "break-word",
        "padding": "8px 50px 8px 10px",
        "width": "50%"
      },
    }, [ 
      h("p", {
        style: {
          "margin-bottom": "5px", 
          "font-family": "IBMPlexMono-Light"}
        }, "Types checked: "),
      h("pre", {
        style: {
          "white-space": "pre-wrap",
          "white-space": "-o-pre-wrap",
          "white-space": "-moz-pre-wrap !important",
        }}, this.repl)] );

    const container_editable = h("div", {
      style: {
        "flex-direction": "column",
        "background": "white",//"rgb(246, 246, 246)",
        // "flex": "1 1 0",
        // "border-top": "1px solid rgb(180,180,180)",
        // "border-bottom": "1px solid rgb(180,180,180)",
        "box-shadow": "0px 0px 5px 0px rgba(207,205,207,1)",
        "width": "100%",
        "word-wrap": "break-word",
      }
    }, [head, body]);

    const container = h("div", {
      style: {
        "border-collapse": "separate",
        // "margin": "30px",
        "display": "flex",
        "flex-direction": "row",
        "height": "83%",
        // "flex": "2 1",
        // "justify-content": "space-between"
      }
    }, [container_editable, repl]);

    return h("div", {
      style: {
        "height": "calc(100% - 38px)",
      },
    }, [
      title_div,
      container,
      buttons,
      // repl,
    ]);
  }
};

module.exports = Write;

