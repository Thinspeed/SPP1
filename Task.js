const Status = { 
    Created : 'created',  
    Canceled : 'canceled',
    Done : 'done',
}

class Task {
    constructor(id, name, status, date) {
        this.Id = id;
        this.Name = name;
        this.Status = status; 
        this.Date = date;
    }
}

module.exports = { Task, Status };