var execute = (function() {
    function execute(info) {
        if (!(this instanceof execute)) {
            return new execute(info);
        }

        var _this = this;
        var run = true;
        var blocked = false;
        var input = null;
        var _t = null;

        var memory = info.translation;
        var stack = [];
        var max_stack_size = 5;
        var program_counter = 0;


        this.resolve_code_to_name = function(code) {
            // should return the string name of the function corresponding to
            // the code in the symbol  table
            for (var name in symbol_table) {
                if (symbol_table.hasOwnProperty(name)
                        && symbol_table[name] === code) {
                    return name;
                }
            }
        };

        this.begin = function(params) {
            run = true;
        };

        this.end = function(params) {
            run = false;
        };

        this.read = function(params) {
            if (input) {
                blocked = false;
                var num = parseInt(input);
                if (input.length > 2 || isNaN(input)) {
                    throw new Error('Invalid Input!');
                }
                memory[params] = num;
                input = null;
            } else {
                $(document).trigger({
                    type: 'askinput',
                    message: 'Enter a number'
                });
                blocked = true;
            }
        };

        this.disp = function(params) {
            if (memory[params] === undefined) {
                throw new Error('Trying to access an undefined variable!');
            }
            $(document).trigger({ type: 'disp', value: memory[params] });
            blocked = true;
            program_counter++;
        };

        this.pushi = function(params) {
            if (stack.length === max_stack_size) {
                throw new Error('Stack Overflow!');
            }
            stack.push(params);
        };

        this.pushv = function(params) {
            if (memory[params] === undefined) {
                throw new Error('Trying to access an undefined variable!');
            }
            if (stack.length === max_stack_size) {
                throw new Error('Stack Overflow!');
            }
            stack.push(memory[params]);
        };

        this.pop = function(params) {
            if (stack.length <= 0) {
                throw new Error('Stack Empty!');
            }
            memory[params] = stack.pop();
        };

        this.mod = function(params) {
            var stack_size = stack.length;
            if (stack_size < 2) {
                throw new Error('Null Operand!');
            }
            if (stack_size === max_stack_size) {
                throw new Error('Stack Overflow!');
            }
            var m = stack[stack_size - 2] % stack[stack_size - 1];
            stack.push(m);
        };

        this.jmp = function(params) {
            program_counter = params;
        };

        this.jl = function(params) {
            var l = stack.length;
            if (l >= 2 && stack[l - 1] < stack[l - 2]) {
                this.jmp(params);
            } else if (l < 2) {
                throw new Error('Null Compare Error!');
            }
        };

        this.jg = function(params) {
            var l = stack.length;
            if (l >= 2 && stack[l - 1] > stack[l - 2]) {
                this.jmp(params);
            } else if (l < 2) {
                throw new Error('Null Compare Error!');
            }
        };

        this.jeq = function(params) {
            var l = stack.length;
            if (l >= 2 && stack[l - 1] === stack[l - 2]) {
                this.jmp(params);
            } else if (l < 2) {
                throw new Error('Null Compare Error!');
            }
        };

        this.add = function() {
            var l = stack.length;
            if (l >= 2) {
                var sum = stack.pop() + stack.pop();
                if (sum <= 99) {
                    this.pushi(sum);
                } else {
                    throw new Error('Overflow Error!');
                }
            } else {
                throw new Error('Null Operand Error!');
            }
        };

        this.sub = function() {
            var l = stack.length;
            if (l >= 2) {
                var diff = stack.pop() - stack.pop();
                if (diff >= 0) {
                    this.pushi(diff);
                } else {
                    throw new Error('Overflow Error!');
                }
            } else {
                throw new Error('Null Operand Error!');
            }
        };

        this.cmp = function() {
            var l = stack.length;
            if (l >= 2) {
                this.pushi(stack.pop() === stack.pop() ? 1 : 0);
            } else if (l < 2) {
                throw new Error('Null Compare Error!');
            }
        };

        this.labeldef = function() {
            // do nothing :)
        };

        this.input = function(value) {
            input = value;
        };

        this.execute_one = function() {
            if (run) {
                if (!blocked) {
                    $(document).trigger({ type: 'changedpc', pc: program_counter });
                    var command = memory[program_counter];
                    var code = command.substring(0, 2);
                    var params = parseInt(command.substring(2));
                    var prev_pc = program_counter;
                    var func = _this.resolve_code_to_name(code);
                    try {
                        _this[func](params);
                    } catch (e) {
                        $(document).trigger({ type: 'error', error: e.message });
                        run = false;
                    }
                    if (!blocked) {
                        if (program_counter === prev_pc) {
                            program_counter += 1;
                        }
                        $(document).trigger({ type: 'stack', stack: stack });
                    }
                }
            } else {
                clearInterval(_t);
                $(document).trigger({ type: 'done' });
            }
        };

        this.execute = function() {
            _t = setInterval(_this.execute_one, 1000);
        };

        this.unblock = function() {
            blocked = false;
        };
    }


    return execute;
})();
