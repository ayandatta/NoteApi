const fs = require('fs');

createNote = function(title, body)
{
    var note =
    {
        title,
        body
    }

    var notes = fetchAllNotes();
    var currentNote = notes.filter((note) => note.title === title);
    if (currentNote.length === 0)
    {  
        notes.push(note);
        saveNote(notes);
        return note;
    }
}

getAllNotes = () =>
{
    return fetchAllNotes();
}

readNote = (title) =>
{
    var notes = fetchAllNotes();
    var pickNote = notes.filter((note) => note.title === title );
    return pickNote[0];    
}

deleteNote = (title) =>
{
    var notes = fetchAllNotes();
    var pickNote = notes.filter((note) => note.title !== title );
    
    saveNote(pickNote);

    return notes.length !== pickNote.length;
}

saveNote = (notes) => 
{
    fs.writeFileSync('notesdata.json', JSON.stringify(notes));
}

updateNote = (title, body) =>
{
    //var notes = fetchAllNotes();
    var note = readNote(title);
    if (note)
    {
        console.log('Note ', note);
        note.body = body;

        deleteNote(title);
        createNote(title, body);
        return note;
    }
    else
    {
        console.log('Note not found');
    }    
}

fetchAllNotes = () =>
{
    try 
    {
        var noteStr = fs.readFileSync('notesdata.json');
        return JSON.parse(noteStr);
    } 
    catch (error) {
        return [];
    }    
}

module.exports = 
{
    createNote,
    getAllNotes,
    readNote,
    deleteNote,
    updateNote
}