import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {ModalService} from "../../services/modal.service";
import {IClip} from "../../models/clip.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ClipService} from "../../services/clip.service";

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges{

  @Input() activeClip:IClip | null = null
  inSubmission = false
  showAlert = false
  alertColor = 'blue'
  alertMsg = 'Please wait! Updating clip'
  @Output() update = new EventEmitter()

  clipID = new FormControl('')
  title = new FormControl('', [
    Validators.required,
    Validators.minLength(3)]);
  editForm = new FormGroup({
    title: this.title,
    id: this.clipID,
  })

  constructor(
    private modal:ModalService,
    private clipService: ClipService) {
  }

  ngOnInit(): void {
    this.modal.register('editClip')
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip')
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.activeClip){
      return
    }
    this.title.setValue(this.activeClip.title)
    this.clipID.setValue(this.activeClip.docID as string)
    this.inSubmission = false
    this.showAlert = true
  }

  async submit(){
    if(!this.activeClip){
      return
    }
    this.inSubmission = true
    this.showAlert=true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait! Updating clip'
    try {
      await this.clipService.updateClip(this.clipID.value as string, this.title.value as string)
    }catch (error){
      this.inSubmission = false
      this.alertColor = 'red'
      this.alertMsg = 'Please try again later'
      console.log(error)
      return
    }

    this.activeClip.title = this.title.value as string
    this.update.emit(this.activeClip)
    this.inSubmission = false
    this.alertColor = 'green'
    this.alertMsg = 'Success!'
  }

}
