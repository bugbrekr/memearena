from pydantic import BaseModel
from typing import Any

class ResponseModel(BaseModel):
    success: bool
    code: int
    data: dict[str, Any] | None = None
    
    def model_dump(self, **kwargs):
        result = super().model_dump(**kwargs)
        data_fields = {}
        fields_to_remove = []
        
        for field_name, field_value in result.items():
            if field_name not in {'success', 'code', 'data'} and field_value is not None:
                data_fields[field_name] = field_value
                fields_to_remove.append(field_name)
        for field_name in fields_to_remove:
            result.pop(field_name, None)
        if data_fields:
            result['data'] = data_fields
        elif 'data' in result and result['data'] is None:
            result.pop('data')
        return result