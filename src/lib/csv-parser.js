/**
 *  recursive descent parser for standard csv grammar
 */
export class Parser {
    ESCAPED = '"';
    CR = '\r';
    LF = '\n'
    COMMA = ','
    // LINE_END = `${this.CR}${this.LF}`;
    position = 0;
    input = "";
    // TODO: config: COMMA (may be two or more letter) OR LINE_END?
    constructor() {
    }

    parseFile(input) {
        this.input = input;
        this.position = 0;

        let result = [];

        if (this.position < this.input.length) {
            result.push(this.parseHeader());
            this.consumeCRLF();

            while (this.position < this.input.length) {
                result.push(this.parseRecord());

                if (this.checkPeek(this.CR) || this.checkPeek(this.LF)) {
                    this.consumeCRLF();
                } else {
                    break;
                }

            }
        }

        if (this.position !== this.input.length) {
            throw new Error(`Unexpected character at position ${this.position}`);
        }

        return result;
    }

    parseHeader() {
        return this.parseCommaSeparated(this.parseName);
    }

    parseRecord() {
        return this.parseCommaSeparated(this.parseField);
    }

    parseCommaSeparated(func) {
        let result = [func.call(this)];

        while (this.checkPeek(this.COMMA)) {
            this.consumeChar();
            result.push(func.call(this));
        }

        return result;
    }

    parseName() {
        return this.parseField();
    }


    parseField() {
        // TODO: first,last,address,city,zip
        // John,Doe,120 any st.,"Anytown, WW",08123
        if (this.checkPeek(this.ESCAPED)) {
            return this.parseEscaped();
        }
        return this.parseNonEscaped();
    }

    parseEscaped() {
        this.consumeChar(); // Consume DQUOTE
        let result = '';

        while (!this.checkPeek(this.ESCAPED)) {
            // if (this.checkPeek('\\')) {
            //     this.consumeChar(); // eat \ chat, then eat next chat in next line
            // }

            result += this.consumeChar();

            // TOfix: a,b
            // 1,"ha ""ha"" ha"
            // 3,4
            if (this.checkPeek(this.ESCAPED)) {
                this.consumeChar();  // Consume DQUOTE
                if (this.checkPeek(this.ESCAPED)) {
                    result += this.consumeChar();  // add 2DQUOTE as one.
                } else {
                    break;
                }
            }
        }

        if (this.checkPeek(this.ESCAPED)) {
            this.consumeChar();  // Consume DQUOTE
        }


        return result;
    }

    parseNonEscaped() {
        let result = '';

        while (this.checkFieldNotEnd()) {
            result += this.consumeChar();
        }

        return result;
    }



    consumeCRLF() {
        this.consumeCR();
        this.consumeLF();
    }

    consumeCR() {
        if (this.checkNotEmpty(this.CR)) {
            if (this.checkPeek(this.CR)) {
                this.consumeChar();
            } else {
                // ignorable
            }
        }
    }

    consumeLF() {
        if (this.checkNotEmpty(this.LF)) {
            if (this.checkPeek(this.LF)) {
                this.consumeChar();
            } else {
                throw new Error(`Expected newline at position ${this.position}`);
            }
        }
    }

    consumeChar() {
        return this.input[this.position++];
    }

    peek() {
        return this.input[this.position];
    }

    // MARK: check functions
    checkFieldNotEnd() {
        if (this.checkPeek(this.COMMA)) {
            return false;
        }

        return !this.checkPeek(this.CR) && !this.checkPeek(this.LF)
            && this.position < this.input.length;
    }

    checkPeek(target) {
        return this.peek() === target;
    }

    checkNotEmpty(str) {
        return str !== undefined && str !== null && str !== ''
    }


    json(parsedHeaderAndRecords) {
        let [header, ...records] = parsedHeaderAndRecords;
        return records.map(record => {
            let result = {};
            header.forEach((field, index) => {
                result[field] = record[index];
            });
            return result;
        });
    }
}
