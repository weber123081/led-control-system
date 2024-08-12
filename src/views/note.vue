<template>
    <div id="note">
        <div v-for="(note, index) in notes" :key="index" class="note"
            :style="{ top: note.top + 'px', left: note.left + 'px' }" @mousedown="startDrag($event, index)">
            <textarea v-model="note.content"></textarea>
            <button @click="removeNote(index)">X</button>
        </div>
        <button @click="addNote">Add Note</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            notes: [
                { content: 'Note 1', top: 50, left: 50 },
                { content: 'Note 2', top: 150, left: 150 }
            ],
            dragging: false,
            currentNoteIndex: null,
            offsetX: 0,
            offsetY: 0,
            noteRect: null
        };
    },
    methods: {
        addNote() {
            this.notes.push({ content: 'New Note', top: 100, left: 100 });
        },
        removeNote(index) {
            this.notes.splice(index, 1);
        },
        startDrag(event, index) {
            this.dragging = true;
            this.currentNoteIndex = index;
            this.offsetX = event.clientX - this.notes[index].left;
            this.offsetY = event.clientY - this.notes[index].top;

            // 获取 #note 的尺寸和位置
            this.noteRect = document.getElementById('note').getBoundingClientRect();

            document.addEventListener('mousemove', this.dragNote);
            document.addEventListener('mouseup', this.stopDrag);
        },
        dragNote(event) {
            if (this.dragging) {
                let newLeft = event.clientX - this.offsetX;
                let newTop = event.clientY - this.offsetY;

                // 确保便签不会超出 #note 的边界
                const noteWidth = 200; // 与 .note 的宽度相同
                const noteHeight = 200; // 与 .note 的高度相同

                if (newLeft < 0) {
                    newLeft = 0;
                }
                if (newLeft + noteWidth > this.noteRect.width) {
                    newLeft = this.noteRect.width - noteWidth;
                }
                if (newTop < 0) {
                    newTop = 0;
                }
                if (newTop + noteHeight > this.noteRect.height) {
                    newTop = this.noteRect.height - noteHeight;
                }

                this.notes[this.currentNoteIndex].left = newLeft;
                this.notes[this.currentNoteIndex].top = newTop;
            }
        },
        stopDrag() {
            this.dragging = false;
            document.removeEventListener('mousemove', this.dragNote);
            document.removeEventListener('mouseup', this.stopDrag);
        }
    }
};
</script>

<style>
#note {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    text-align: center;
    font-family: 'Stick', sans-serif;
    font-size: 30px;
    position: absolute;
    top: 55px;
    left: 200px;
    width: calc(100% - 200px);
    height: calc(100% - 55px);
    background-color: #696969;
    color: #fff;
}

.note {
    position: absolute;
    width: 200px;
    height: 200px;
    background-color: #fff9c4;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    padding: 10px;
    box-sizing: border-box;
    cursor: move;
}

textarea {
    width: 100%;
    height: calc(100% - 30px);
    border: none;
    background: transparent;
    resize: none;
    font-size: 16px;
}

button {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: transparent;
    border: none;
    font-weight: bold;
    cursor: pointer;
}
</style>
