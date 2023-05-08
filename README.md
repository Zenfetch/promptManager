# promptmanager README

PromptManager allows you to define your prompts in a simple UI directly in VSCode. These prompts are then saved
in a `generated_prompts` folder as protobuf files which can easily be read by your preferred programming language.

## How to use

Open up your command pallette in VSCode and type `Show Prompt Manager UI`. This will immediately create a `generated_prompts` directory
which will house the `prompt.proto` file along with any prompts you create using the extension. When you `Save` a prompt, the prompt is 
stored as a `.pb` file which can be read in your code using the protobuf library. Below is the Prompt schema along with example code to 
read the prompts for Python. Make sure you have protobuf installed on your machine.

### Protobuf Schema

```proto
syntax = "proto3";

message Prompt {
  string id = 1;
  string title = 2;
  string content = 3;
  repeated string variables = 4;
  int32 tokenCount = 5;
}
```

### Python
 
1. Install the protobuf library: 

`pip install protobuf`

2. Compile the `prompt.proto` file to generate the Python module. This takes place after you have saved a prompt: 

`protoc --python_out=. <path_to_prompt.proto>` 

3. Now, you should have a `prompt_pb2.py` file in the same directory as your `prompt.proto`. You can use this module to read the .pb files. 
Here's a Python code snippet as an example:

```python
import prompt_pb2
import os

def read_prompt_file(file_path):
    prompt = prompt_pb2.Prompt()
    
    with open(file_path, "rb") as f:
        prompt.ParseFromString(f.read())
    
    return prompt

# Replace with the actual path to the generated_prompts and example.pb file
generated_prompts_path = "path/to/generated_prompts"
pb_file = os.path.join(generated_prompts_path, "example.pb")

prompt_data = read_prompt_file(pb_file)
print(prompt_data)
```

### Javascript (Node)
 
1. Install the protobufjs library: 

`npm install protobufjs`

2. Compile the `prompt.proto` file to generate the Javascript module. This takes place after you have saved a prompt: 

`npx pbjs -t static-module -w commonjs -o prompt_pb.js prompt.proto` 

3. Create a new JavaScript file, e.g., `read_pb.js`. You can use this module to read the `.pb` files. Here's a JavaScript code snippet as an example::

```javascript
const fs = require('fs');
const protobuf = require('protobufjs');

protobuf.load("prompt_pb.js", function(err, root) {
    if (err) {
        throw err;
    }

    // Obtain a message type
    const Prompt = root.lookupType("Prompt");

    function readPromptFile(filePath) {
        const buffer = fs.readFileSync(filePath);
        const decodedPrompt = Prompt.decode(buffer);
        return decodedPrompt;
    }

    // Replace with the actual path to the generated_prompts and example.pb file
    const generatedPromptsPath = "path/to/generated_prompts";
    const pbFile = `${generatedPromptsPath}/example.pb`;

    const promptData = readPromptFile(pbFile);
    console.log(promptData);
});
```

## Features

- Write and edit prompts
- Include variables with ``{{<variable_name>}}``
- Save and remove prompts easily
- See how many tokens are included in your prompt

![](https://github.com/Zenfetch/promptManager/raw/main/PromptManager.gif)

## Release Notes

Courtesy of Zenfetch

## Upcoming features

1. Group prompts into collections

### 1.0.0

Initial release of PromptManager