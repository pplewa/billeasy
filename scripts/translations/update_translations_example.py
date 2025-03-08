import json
import os

# Translations for different languages
TRANSLATIONS = {
    'en': {
        'invoice': {
            'export': {
                'title': 'Export Invoice',
                'description': 'Choose a format to export your invoice',
                'formats': {
                    'pdf': 'Export as PDF',
                    'json': 'Export as JSON',
                    'csv': 'Export as CSV',
                    'xlsx': 'Export as XLSX',
                    'xml': 'Export as XML'
                }
            },
            'addressSwap': {
                'toast': {
                    'title': 'Addresses Swapped',
                    'description': 'The Bill From and Bill To information has been switched.'
                }
            },
            'email': {
                'title': 'Send Invoice Email',
                'description': 'Send this invoice via email to your client.',
                'defaultSubject': 'Invoice from Your Company',
                'defaultMessage': 'Please find attached the invoice for your recent purchase.',
                'recipient': {
                    'label': 'Recipient Email',
                    'placeholder': 'client@example.com'
                },
                'subject': {
                    'label': 'Subject',
                    'placeholder': 'Invoice from Your Company'
                },
                'message': {
                    'label': 'Message',
                    'placeholder': 'Enter your message here'
                },
                'buttons': {
                    'cancel': 'Cancel',
                    'send': 'Send Email',
                    'sending': 'Sending...'
                },
                'toast': {
                    'success': {
                        'title': 'Success',
                        'description': 'Email sent to {recipient}'
                    },
                    'error': {
                        'title': 'Error',
                        'description': 'Failed to send email. Please try again.'
                    }
                }
            },
            'filters': {
                'status': {
                    'label': 'Status',
                    'placeholder': 'All Statuses',
                    'options': {
                        'all': 'All Statuses',
                        'draft': 'Draft',
                        'pending': 'Pending',
                        'paid': 'Paid',
                        'overdue': 'Overdue',
                        'cancelled': 'Cancelled'
                    }
                },
                'search': {
                    'label': 'Search',
                    'placeholder': 'Search by client, invoice number, etc.',
                    'clear': 'Clear search'
                },
                'clearFilters': 'Clear Filters'
            },
            'statusSelector': {
                'statuses': {
                    'draft': 'Draft',
                    'pending': 'Pending',
                    'paid': 'Paid',
                    'overdue': 'Overdue',
                    'cancelled': 'Cancelled'
                },
                'toast': {
                    'title': 'Status Updated',
                    'description': 'Invoice status changed to {status}',
                    'error': {
                        'title': 'Error',
                        'description': 'Failed to update invoice status'
                    }
                }
            }
        }
    },
    'es': {
        'invoice': {
            'export': {
                'title': 'Exportar Factura',
                'description': 'Elija un formato para exportar su factura',
                'formats': {
                    'pdf': 'Exportar como PDF',
                    'json': 'Exportar como JSON',
                    'csv': 'Exportar como CSV',
                    'xlsx': 'Exportar como XLSX',
                    'xml': 'Exportar como XML'
                }
            },
            'addressSwap': {
                'toast': {
                    'title': 'Direcciones Intercambiadas',
                    'description': 'La información de Facturar Desde y Facturar A ha sido cambiada.'
                }
            },
            'email': {
                'title': 'Enviar correo electrónico de factura',
                'description': 'Envíe esta factura por correo electrónico a su cliente.',
                'defaultSubject': 'Factura de su empresa',
                'defaultMessage': 'Encuentre adjunta la factura de su compra reciente.',
                'recipient': {
                    'label': 'Correo electrónico del destinatario',
                    'placeholder': 'cliente@ejemplo.com'
                },
                'subject': {
                    'label': 'Asunto',
                    'placeholder': 'Factura de su empresa'
                },
                'message': {
                    'label': 'Mensaje',
                    'placeholder': 'Escriba su mensaje aquí'
                },
                'buttons': {
                    'cancel': 'Cancelar',
                    'send': 'Enviar correo electrónico',
                    'sending': 'Enviando...'
                },
                'toast': {
                    'success': {
                        'title': 'Éxito',
                        'description': 'Correo electrónico enviado a {recipient}'
                    },
                    'error': {
                        'title': 'Error',
                        'description': 'No se pudo enviar el correo electrónico. Inténtelo de nuevo.'
                    }
                }
            },
            'filters': {
                'status': {
                    'label': 'Estado',
                    'placeholder': 'Todos los estados',
                    'options': {
                        'all': 'Todos los estados',
                        'draft': 'Borrador',
                        'pending': 'Pendiente',
                        'paid': 'Pagado',
                        'overdue': 'Vencido',
                        'cancelled': 'Cancelado'
                    }
                },
                'search': {
                    'label': 'Buscar',
                    'placeholder': 'Buscar por cliente, número de factura, etc.',
                    'clear': 'Limpiar búsqueda'
                },
                'clearFilters': 'Limpiar filtros'
            },
            'statusSelector': {
                'statuses': {
                    'draft': 'Borrador',
                    'pending': 'Pendiente',
                    'paid': 'Pagado',
                    'overdue': 'Vencido',
                    'cancelled': 'Cancelado'
                },
                'toast': {
                    'title': 'Estado actualizado',
                    'description': 'Estado de la factura cambiado a {status}',
                    'error': {
                        'title': 'Error',
                        'description': 'No se pudo actualizar el estado de la factura'
                    }
                }
            }
        }
    },
    'pt': {
        'invoice': {
            'export': {
                'title': 'Exportar Fatura',
                'description': 'Escolha um formato para exportar sua fatura',
                'formats': {
                    'pdf': 'Exportar como PDF',
                    'json': 'Exportar como JSON',
                    'csv': 'Exportar como CSV',
                    'xlsx': 'Exportar como XLSX',
                    'xml': 'Exportar como XML'
                }
            },
            'addressSwap': {
                'toast': {
                    'title': 'Endereços Trocados',
                    'description': 'As informações de Faturar De e Faturar Para foram alteradas.'
                }
            },
            'email': {
                'title': 'Enviar e-mail de fatura',
                'description': 'Envie esta fatura por e-mail para seu cliente.',
                'defaultSubject': 'Fatura da sua empresa',
                'defaultMessage': 'Encontre em anexo a fatura da sua compra recente.',
                'recipient': {
                    'label': 'E-mail do destinatário',
                    'placeholder': 'cliente@exemplo.com'
                },
                'subject': {
                    'label': 'Assunto',
                    'placeholder': 'Fatura da sua empresa'
                },
                'message': {
                    'label': 'Mensagem',
                    'placeholder': 'Digite sua mensagem aqui'
                },
                'buttons': {
                    'cancel': 'Cancelar',
                    'send': 'Enviar e-mail',
                    'sending': 'Enviando...'
                },
                'toast': {
                    'success': {
                        'title': 'Sucesso',
                        'description': 'E-mail enviado para {recipient}'
                    },
                    'error': {
                        'title': 'Erro',
                        'description': 'Falha ao enviar o e-mail. Tente novamente.'
                    }
                }
            },
            'filters': {
                'status': {
                    'label': 'Status',
                    'placeholder': 'Todos os status',
                    'options': {
                        'all': 'Todos os status',
                        'draft': 'Rascunho',
                        'pending': 'Pendente',
                        'paid': 'Pago',
                        'overdue': 'Vencido',
                        'cancelled': 'Cancelado'
                    }
                },
                'search': {
                    'label': 'Pesquisar',
                    'placeholder': 'Pesquisar por cliente, número da fatura, etc.',
                    'clear': 'Limpar pesquisa'
                },
                'clearFilters': 'Limpar filtros'
            },
            'statusSelector': {
                'statuses': {
                    'draft': 'Rascunho',
                    'pending': 'Pendente',
                    'paid': 'Pago',
                    'overdue': 'Vencido',
                    'cancelled': 'Cancelado'
                },
                'toast': {
                    'title': 'Status atualizado',
                    'description': 'Status da fatura alterado para {status}',
                    'error': {
                        'title': 'Erro',
                        'description': 'Falha ao atualizar o status da fatura'
                    }
                }
            }
        }
    },
    'pl': {
        'invoice': {
            'export': {
                'title': 'Eksportuj fakturę',
                'description': 'Wybierz format eksportu faktury',
                'formats': {
                    'pdf': 'Eksportuj jako PDF',
                    'json': 'Eksportuj jako JSON',
                    'csv': 'Eksportuj jako CSV',
                    'xlsx': 'Eksportuj jako XLSX',
                    'xml': 'Eksportuj jako XML'
                }
            },
            'addressSwap': {
                'toast': {
                    'title': 'Adresy zamienione',
                    'description': 'Informacje o nadawcy i odbiorcy zostały zamienione.'
                }
            },
            'email': {
                'title': 'Wyślij fakturę e-mailem',
                'description': 'Wyślij tę fakturę e-mailem do klienta.',
                'defaultSubject': 'Faktura z Twojej firmy',
                'defaultMessage': 'W załączniku znajduje się faktura za Twoją ostatnią transakcję.',
                'recipient': {
                    'label': 'E-mail odbiorcy',
                    'placeholder': 'klient@przyklad.com'
                },
                'subject': {
                    'label': 'Temat',
                    'placeholder': 'Faktura z Twojej firmy'
                },
                'message': {
                    'label': 'Wiadomość',
                    'placeholder': 'Wpisz swoją wiadomość tutaj'
                },
                'buttons': {
                    'cancel': 'Anuluj',
                    'send': 'Wyślij e-mail',
                    'sending': 'Wysyłanie...'
                },
                'toast': {
                    'success': {
                        'title': 'Sukces',
                        'description': 'E-mail wysłany do {recipient}'
                    },
                    'error': {
                        'title': 'Błąd',
                        'description': 'Nie udało się wysłać e-maila. Spróbuj ponownie.'
                    }
                }
            },
            'filters': {
                'status': {
                    'label': 'Status',
                    'placeholder': 'Wszystkie statusy',
                    'options': {
                        'all': 'Wszystkie statusy',
                        'draft': 'Szkic',
                        'pending': 'Oczekujące',
                        'paid': 'Zapłacone',
                        'overdue': 'Przeterminowane',
                        'cancelled': 'Anulowane'
                    }
                },
                'search': {
                    'label': 'Szukaj',
                    'placeholder': 'Szukaj po kliencie, numerze faktury itp.',
                    'clear': 'Wyczyść wyszukiwanie'
                },
                'clearFilters': 'Wyczyść filtry'
            },
            'statusSelector': {
                'statuses': {
                    'draft': 'Szkic',
                    'pending': 'Oczekujące',
                    'paid': 'Zapłacone',
                    'overdue': 'Przeterminowane',
                    'cancelled': 'Anulowane'
                },
                'toast': {
                    'title': 'Status zaktualizowany',
                    'description': 'Status faktury zmieniony na {status}',
                    'error': {
                        'title': 'Błąd',
                        'description': 'Nie udało się zaktualizować statusu faktury'
                    }
                }
            }
        }
    },
    'zh': {
        'invoice': {
            'export': {
                'title': '导出发票',
                'description': '选择导出发票的格式',
                'formats': {
                    'pdf': '导出为 PDF',
                    'json': '导出为 JSON',
                    'csv': '导出为 CSV',
                    'xlsx': '导出为 XLSX',
                    'xml': '导出为 XML'
                }
            },
            'addressSwap': {
                'toast': {
                    'title': '地址已交换',
                    'description': '发件人和收件人信息已交换。'
                }
            },
            'email': {
                'title': '发送发票电子邮件',
                'description': '通过电子邮件将此发票发送给您的客户。',
                'defaultSubject': '来自您公司的发票',
                'defaultMessage': '请查看最近购买的发票附件。',
                'recipient': {
                    'label': '收件人电子邮件',
                    'placeholder': 'client@example.com'
                },
                'subject': {
                    'label': '主题',
                    'placeholder': '来自您公司的发票'
                },
                'message': {
                    'label': '消息',
                    'placeholder': '在此处输入您的消息'
                },
                'buttons': {
                    'cancel': '取消',
                    'send': '发送电子邮件',
                    'sending': '正在发送...'
                },
                'toast': {
                    'success': {
                        'title': '成功',
                        'description': '电子邮件已发送至 {recipient}'
                    },
                    'error': {
                        'title': '错误',
                        'description': '发送电子邮件失败。请重试。'
                    }
                }
            },
            'filters': {
                'status': {
                    'label': '状态',
                    'placeholder': '所有状态',
                    'options': {
                        'all': '所有状态',
                        'draft': '草稿',
                        'pending': '待处理',
                        'paid': '已付款',
                        'overdue': '逾期',
                        'cancelled': '已取消'
                    }
                },
                'search': {
                    'label': '搜索',
                    'placeholder': '按客户、发票号等搜索',
                    'clear': '清除搜索'
                },
                'clearFilters': '清除过滤器'
            },
            'statusSelector': {
                'statuses': {
                    'draft': '草稿',
                    'pending': '待处理',
                    'paid': '已付款',
                    'overdue': '逾期',
                    'cancelled': '已取消'
                },
                'toast': {
                    'title': '状态已更新',
                    'description': '发票状态已更改为 {status}',
                    'error': {
                        'title': '错误',
                        'description': '无法更新发票状态'
                    }
                }
            }
        }
    },
    'de': {
        'invoice': {
            'export': {
                'title': 'Rechnung exportieren',
                'description': 'Wählen Sie ein Format zum Exportieren der Rechnung',
                'formats': {
                    'pdf': 'Als PDF exportieren',
                    'json': 'Als JSON exportieren',
                    'csv': 'Als CSV exportieren',
                    'xlsx': 'Als XLSX exportieren',
                    'xml': 'Als XML exportieren'
                }
            },
            'addressSwap': {
                'toast': {
                    'title': 'Adressen getauscht',
                    'description': 'Die Informationen von Rechnungsersteller und Rechnungsempfänger wurden getauscht.'
                }
            },
            'email': {
                'title': 'Rechnung per E-Mail senden',
                'description': 'Senden Sie diese Rechnung per E-Mail an Ihren Kunden.',
                'defaultSubject': 'Rechnung von Ihrem Unternehmen',
                'defaultMessage': 'Bitte finden Sie die Rechnung für Ihren letzten Einkauf im Anhang.',
                'recipient': {
                    'label': 'E-Mail-Empfänger',
                    'placeholder': 'kunde@beispiel.com'
                },
                'subject': {
                    'label': 'Betreff',
                    'placeholder': 'Rechnung von Ihrem Unternehmen'
                },
                'message': {
                    'label': 'Nachricht',
                    'placeholder': 'Geben Sie hier Ihre Nachricht ein'
                },
                'buttons': {
                    'cancel': 'Abbrechen',
                    'send': 'E-Mail senden',
                    'sending': 'Wird gesendet...'
                },
                'toast': {
                    'success': {
                        'title': 'Erfolg',
                        'description': 'E-Mail gesendet an {recipient}'
                    },
                    'error': {
                        'title': 'Fehler',
                        'description': 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.'
                    }
                }
            },
            'filters': {
                'status': {
                    'label': 'Status',
                    'placeholder': 'Alle Status',
                    'options': {
                        'all': 'Alle Status',
                        'draft': 'Entwurf',
                        'pending': 'Ausstehend',
                        'paid': 'Bezahlt',
                        'overdue': 'Überfällig',
                        'cancelled': 'Storniert'
                    }
                },
                'search': {
                    'label': 'Suchen',
                    'placeholder': 'Suchen nach Kunde, Rechnungsnummer usw.',
                    'clear': 'Suche löschen'
                },
                'clearFilters': 'Filter löschen'
            },
            'statusSelector': {
                'statuses': {
                    'draft': 'Entwurf',
                    'pending': 'Ausstehend',
                    'paid': 'Bezahlt',
                    'overdue': 'Überfällig',
                    'cancelled': 'Storniert'
                },
                'toast': {
                    'title': 'Status aktualisiert',
                    'description': 'Rechnungsstatus geändert zu {status}',
                    'error': {
                        'title': 'Fehler',
                        'description': 'Rechnungsstatus konnte nicht aktualisiert werden'
                    }
                }
            }
        }
    },
    'fr': {
        'invoice': {
            'export': {
                'title': 'Exporter la facture',
                'description': 'Choisissez un format pour exporter votre facture',
                'formats': {
                    'pdf': 'Exporter en PDF',
                    'json': 'Exporter en JSON',
                    'csv': 'Exporter en CSV',
                    'xlsx': 'Exporter en XLSX',
                    'xml': 'Exporter en XML'
                }
            },
            'addressSwap': {
                'toast': {
                    'title': 'Adresses échangées',
                    'description': 'Les informations de Facturer De et Facturer À ont été échangées.'
                }
            },
            'email': {
                'title': 'Envoyer la facture par e-mail',
                'description': 'Envoyez cette facture par e-mail à votre client.',
                'defaultSubject': 'Facture de votre entreprise',
                'defaultMessage': 'Veuillez trouver en pièce jointe la facture de votre achat récent.',
                'recipient': {
                    'label': 'E-mail du destinataire',
                    'placeholder': 'client@exemple.com'
                },
                'subject': {
                    'label': 'Objet',
                    'placeholder': 'Facture de votre entreprise'
                },
                'message': {
                    'label': 'Message',
                    'placeholder': 'Saisissez votre message ici'
                },
                'buttons': {
                    'cancel': 'Annuler',
                    'send': 'Envoyer un e-mail',
                    'sending': 'Envoi en cours...'
                },
                'toast': {
                    'success': {
                        'title': 'Succès',
                        'description': 'E-mail envoyé à {recipient}'
                    },
                    'error': {
                        'title': 'Erreur',
                        'description': 'Échec de l\'envoi de l\'e-mail. Veuillez réessayer.'
                    }
                }
            },
            'filters': {
                'status': {
                    'label': 'Statut',
                    'placeholder': 'Tous les statuts',
                    'options': {
                        'all': 'Tous les statuts',
                        'draft': 'Brouillon',
                        'pending': 'En attente',
                        'paid': 'Payé',
                        'overdue': 'En retard',
                        'cancelled': 'Annulé'
                    }
                },
                'search': {
                    'label': 'Rechercher',
                    'placeholder': 'Rechercher par client, numéro de facture, etc.',
                    'clear': 'Effacer la recherche'
                },
                'clearFilters': 'Effacer les filtres'
            },
            'statusSelector': {
                'statuses': {
                    'draft': 'Brouillon',
                    'pending': 'En attente',
                    'paid': 'Payé',
                    'overdue': 'En retard',
                    'cancelled': 'Annulé'
                },
                'toast': {
                    'title': 'Statut mis à jour',
                    'description': 'Statut de la facture changé en {status}',
                    'error': {
                        'title': 'Erreur',
                        'description': 'Impossible de mettre à jour le statut de la facture'
                    }
                }
            }
        }
    }
}

def update_translations():
    # Path to the translations directory
    translations_dir = 'src/i18n/messages'
    
    # Iterate through each language file
    for lang_code, translations in TRANSLATIONS.items():
        file_path = os.path.join(translations_dir, f'{lang_code}.json')
        
        # Read the existing file
        with open(file_path, 'r') as f:
            existing_translations = json.load(f)
        
        # Deep merge the new translations
        def deep_merge(existing, new):
            for key, value in new.items():
                if isinstance(value, dict):
                    # If the key doesn't exist or isn't a dict, replace it
                    if key not in existing or not isinstance(existing[key], dict):
                        existing[key] = {}
                    deep_merge(existing[key], value)
                else:
                    existing[key] = value
        
        # Merge the new translations
        deep_merge(existing_translations, translations)
        
        # Write back to the file
        with open(file_path, 'w') as f:
            json.dump(existing_translations, f, indent=2, ensure_ascii=False)
        
        print(f'Updated translations for {lang_code}')

if __name__ == '__main__':
    update_translations() 