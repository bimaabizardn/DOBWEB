class MedicalRecordManager {
    constructor() {
        this.initializeElements();
        this.initializeModals();
        this.initializeEventListeners();
        this.loadMedicalRecords();
    }

    initializeElements() {
        this.recordsTable = document.getElementById('medical-records-table');
        this.addRecordButton = document.getElementById('add-record-button');
        this.confirmDeleteButton = document.getElementById('confirm-delete-button');
        this.currentRecordId = null;
    }

    initializeModals() {
        this.addModal = new bootstrap.Modal(document.getElementById('add-record-modal'));
        this.editModal = new bootstrap.Modal(document.getElementById('edit-record-modal'));
        this.deleteModal = new bootstrap.Modal(document.getElementById('delete-record-modal'));
    }

    initializeEventListeners() {
        if (this.addRecordButton) {
            this.addRecordButton.addEventListener('click', () => this.addModal.show());
        }

        const addForm = document.getElementById('add-record-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddRecord(e));
        }

        const editForm = document.getElementById('edit-record-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditRecord(e));
        }

        if (this.recordsTable) {
            this.recordsTable.addEventListener('click', (e) => {
                const target = e.target.closest('.edit-button, .delete-button');
                if (!target) return;

                this.currentRecordId = target.dataset.id;
                if (target.classList.contains('edit-button')) {
                    this.populateEditModal(this.currentRecordId);
                } else if (target.classList.contains('delete-button')) {
                    this.deleteModal.show();
                }
            });
        }

        if (this.confirmDeleteButton) {
            this.confirmDeleteButton.addEventListener('click', () => this.handleDeleteRecord());
        }

        ['add', 'edit', 'delete'].forEach(type => {
            const closeButton = document.getElementById(`close-${type}-modal`);
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this[`${type}Modal`].hide();
                    if (type === 'edit' || type === 'delete') {
                        this.currentRecordId = null;
                    }
                });
            }
        });
    }

    async loadMedicalRecords() {
        try {
            const token = this.getAuthToken();
            const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/rekammedis/bulk', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const records = await response.json();

            if (this.dataTable) {
                this.dataTable.destroy();
            }

            if (Array.isArray(records) && records.length > 0) {
                this.dataTable = new simpleDatatables.DataTable(this.recordsTable, {
                    data: {
                        headings: [
                            "Nama", "Usia", "Tanggal Masuk", "Berat Badan", "Golongan Darah", 
                            "Tinggi Badan", "ID Rekam Medis", "Tanggal", "Diagnosa", 
                            "Gambar Luka", "Luas Luka", "Derajat Luka", "Kebutuhan Cairan", "Aksi"
                        ],
                        data: records.map(record => ([
                        record.nama,
                        record.usia,
                        record.tanggal_masuk ? record.tanggal_masuk.split('T')[0] : '',
                        record.bb,
                        record.gol_darah,
                        record.tb,
                        record.id_rekam_medis,
                        record.tanggal ? record.tanggal.split('T')[0] : '',
                        record.diagnosa,
                        `<img src="${record.gambar_luka}" width="60" height="60" />`,
                        record.luas_luka,
                        record.derajat_luka,
                        record.kebutuhan_cairan,
                        `<div class="btn-group">
                            <button class="btn btn-sm btn-primary edit-button" data-id="${record.id_rekam_medis}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-button" data-id="${record.id_rekam_medis}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>`
                    ]))
                    }
                });
            } else {
                this.dataTable = new simpleDatatables.DataTable(this.recordsTable);
            }
        } catch (error) {
            console.error('Failed to fetch medical records:', error);
            this.showAlert('error', 'Gagal memuat data rekam medis');
        }
    }

    async populateEditModal(recordId) {
        try {
            const token = this.getAuthToken();
            const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/rekammedis/${recordId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const record = await response.json();

            const fields = ['nama', 'usia', 'bb', 'gol_darah', 'tb', 'diagnosa', 'luas_luka', 
                          'derajat_luka', 'kebutuhan_cairan', 'gambar_luka'];
            fields.forEach(field => {
                const input = document.getElementById(`edit-${field.replace('_', '-')}`);
                if (input) {
                    input.value = record[field];
                }
            });

            // Handle dates separately
            ['tanggal_masuk', 'tanggal'].forEach(dateField => {
                const dateInput = document.getElementById(`edit-${dateField.replace('_', '-')}`);
                if (dateInput && record[dateField]) {
                    dateInput.value = record[dateField].split('T')[0];
                }
            });

            this.editModal.show();
        } catch (error) {
            console.error('Failed to fetch record details:', error);
            this.showAlert('error', 'Gagal memuat detail rekam medis');
        }
    }

    async handleAddRecord(event) {
        event.preventDefault();
        try {
            const formData = new FormData(event.target);
            const token = this.getAuthToken();

            const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/rekammedis', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.addModal.hide();
            event.target.reset();
            this.showAlert('success', 'Rekam medis berhasil ditambahkan');
            await this.loadMedicalRecords();
        } catch (error) {
            console.error('Failed to add medical record:', error);
            this.showAlert('error', 'Gagal menambahkan rekam medis');
        }
    }

        async handleEditRecord(event) {
        event.preventDefault();
        try {
            const formData = new FormData(event.target);
            const token = this.getAuthToken();

            const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/rekammedis/${this.currentRecordId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.editModal.hide();
            this.currentRecordId = null;
            this.showAlert('success', 'Rekam medis berhasil diperbarui');
            await this.loadMedicalRecords();
        } catch (error) {
            console.error('Failed to update medical record:', error);
            this.showAlert('error', 'Gagal memperbarui rekam medis');
        }
    }

    async handleDeleteRecord() {
        try {
            const token = this.getAuthToken();
            const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/rekammedis/${this.currentRecordId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.deleteModal.hide();
            this.currentRecordId = null;
            this.showAlert('success', 'Rekam medis berhasil dihapus');
            await this.loadMedicalRecords();
        } catch (error) {
            console.error('Failed to delete medical record:', error);
            this.showAlert('error', 'Gagal menghapus rekam medis');
        }
    }

    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MedicalRecordManager();
});