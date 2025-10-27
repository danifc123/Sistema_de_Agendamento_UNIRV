import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5160/api';

  // Mock data para testes
  const mockData = {
    id: 1,
    nome: 'Test Item',
    email: 'test@example.com'
  };

  const mockArray = [
    { id: 1, nome: 'Item 1' },
    { id: 2, nome: 'Item 2' },
    { id: 3, nome: 'Item 3' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET Operations', () => {
    it('should retrieve all items via GET', () => {
      const endpoint = 'users';

      service.get(endpoint).subscribe(response => {
        expect(response).toEqual(mockArray);
        expect(response.length).toBe(3);
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockArray);
    });

    it('should retrieve single item by ID via GET', () => {
      const endpoint = 'users';
      const id = 1;

      service.getById(endpoint, id).subscribe(response => {
        expect(response).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle GET request with different endpoints', () => {
      const endpoints = ['alunos', 'psicologos', 'agendamentos'];

      endpoints.forEach(endpoint => {
        service.get(endpoint).subscribe(response => {
          expect(response).toEqual(mockArray);
        });

        const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockArray);
      });
    });
  });

  describe('POST Operations', () => {
    it('should create new item via POST', () => {
      const endpoint = 'users';
      const newData = { nome: 'New User', email: 'new@example.com' };
      const expectedResponse = { ...newData, id: 4 };

      service.post(endpoint, newData).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newData);
      req.flush(expectedResponse);
    });

    it('should handle POST with complex data', () => {
      const endpoint = 'agendamentos';
      const complexData = {
        alunoId: 1,
        psicologoId: 2,
        data: '2024-12-25',
        horario: '14:00',
        status: 'Pendente'
      };

      service.post(endpoint, complexData).subscribe(response => {
        expect(response).toEqual(jasmine.objectContaining(complexData));
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(complexData);
      req.flush({ ...complexData, id: 1 });
    });
  });

  describe('PUT Operations', () => {
    it('should update item via PUT', () => {
      const endpoint = 'users';
      const id = 1;
      const updateData = { nome: 'Updated User', email: 'updated@example.com' };
      const expectedResponse = { ...updateData, id };

      service.put(endpoint, id, updateData).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(expectedResponse);
    });

    it('should handle PUT with partial data', () => {
      const endpoint = 'users';
      const id = 1;
      const partialData = { nome: 'Only Name Updated' };

      service.put(endpoint, id, partialData).subscribe(response => {
        expect(response).toEqual(jasmine.objectContaining(partialData));
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(partialData);
      req.flush({ ...mockData, ...partialData });
    });
  });

  describe('PATCH Operations', () => {
    it('should partially update item via PATCH', () => {
      const endpoint = 'agendamentos';
      const id = 1;
      const patchData = { status: 'Confirmado' };
      const expectedResponse = { ...mockData, ...patchData };

      service.patch(endpoint, id, patchData).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}/${id}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(patchData);
      req.flush(expectedResponse);
    });

    it('should handle PATCH with multiple fields', () => {
      const endpoint = 'users';
      const id = 1;
      const multiPatchData = {
        nome: 'Patched Name',
        status: 'Active',
        lastUpdate: '2024-12-25T10:00:00Z'
      };

      service.patch(endpoint, id, multiPatchData).subscribe(response => {
        expect(response).toEqual(jasmine.objectContaining(multiPatchData));
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}/${id}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(multiPatchData);
      req.flush({ ...mockData, ...multiPatchData });
    });
  });

  describe('DELETE Operations', () => {
    it('should delete item via DELETE', () => {
      const endpoint = 'users';
      const id = 1;
      const deleteResponse = { message: 'Item deleted successfully' };

      service.delete(endpoint, id).subscribe(response => {
        expect(response).toEqual(deleteResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(deleteResponse);
    });

    it('should handle DELETE with different response types', () => {
      const endpoint = 'agendamentos';
      const id = 5;
      const deletedItem = { ...mockData, id, deleted: true };

      service.delete(endpoint, id).subscribe(response => {
        expect(response).toEqual(deletedItem);
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(deletedItem);
    });
  });

  describe('Base URL Configuration', () => {
    it('should use correct base URL for all requests', () => {
      const endpoint = 'test';

      service.get(endpoint).subscribe();
      const getReq = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      expect(getReq.request.url).toBe(`${baseUrl}/${endpoint}`);
      getReq.flush([]);

      service.getById(endpoint, 1).subscribe();
      const getByIdReq = httpMock.expectOne(`${baseUrl}/${endpoint}/1`);
      expect(getByIdReq.request.url).toBe(`${baseUrl}/${endpoint}/1`);
      getByIdReq.flush({});

      service.post(endpoint, {}).subscribe();
      const postReq = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      expect(postReq.request.url).toBe(`${baseUrl}/${endpoint}`);
      postReq.flush({});

      service.put(endpoint, 1, {}).subscribe();
      const putReq = httpMock.expectOne(`${baseUrl}/${endpoint}/1`);
      expect(putReq.request.url).toBe(`${baseUrl}/${endpoint}/1`);
      putReq.flush({});

      service.patch(endpoint, 1, {}).subscribe();
      const patchReq = httpMock.expectOne(`${baseUrl}/${endpoint}/1`);
      expect(patchReq.request.url).toBe(`${baseUrl}/${endpoint}/1`);
      patchReq.flush({});

      service.delete(endpoint, 1).subscribe();
      const deleteReq = httpMock.expectOne(`${baseUrl}/${endpoint}/1`);
      expect(deleteReq.request.url).toBe(`${baseUrl}/${endpoint}/1`);
      deleteReq.flush({});
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors gracefully', () => {
      const endpoint = 'users';
      const errorMessage = 'Server error';

      service.get(endpoint).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Server Error');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });

    it('should handle network errors', () => {
      const endpoint = 'users';

      service.get(endpoint).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.error).toBeInstanceOf(ErrorEvent);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('TypeScript Generic Types', () => {
    interface TestUser {
      id: number;
      nome: string;
      email: string;
    }

    it('should work with typed responses', () => {
      const endpoint = 'users';
      const typedUser: TestUser = { id: 1, nome: 'Typed User', email: 'typed@example.com' };

      service.getById<TestUser>(endpoint, 1).subscribe(response => {
        expect(response.id).toBe(typedUser.id);
        expect(response.nome).toBe(typedUser.nome);
        expect(response.email).toBe(typedUser.email);
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}/1`);
      req.flush(typedUser);
    });

    it('should work with typed arrays', () => {
      const endpoint = 'users';
      const typedUsers: TestUser[] = [
        { id: 1, nome: 'User 1', email: 'user1@example.com' },
        { id: 2, nome: 'User 2', email: 'user2@example.com' }
      ];

      service.get<TestUser>(endpoint).subscribe(response => {
        expect(response.length).toBe(2);
        expect(response[0].nome).toBe('User 1');
        expect(response[1].nome).toBe('User 2');
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      req.flush(typedUsers);
    });
  });
});
