import json

transcript_path = r"C:\Users\SEC\.gemini\antigravity-ide\brain\f444ad47-8297-493b-8680-7555e39f858f\.system_generated\logs\transcript_full.jsonl"
target_file = "src/task/pages/TaskDetailPage.jsx"

content_found = None
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['tool_name'] == 'default_api:write_to_file':
                        args = call['arguments']
                        if args.get('TargetFile', '').endswith('TaskDetailPage.jsx'):
                            content_found = args.get('CodeContent', '')
        except:
            pass

if content_found:
    with open('TaskDetailPage_original.jsx', 'w', encoding='utf-8') as out:
        out.write(content_found)
    print("Found and wrote TaskDetailPage_original.jsx")
else:
    print("Could not find it.")
